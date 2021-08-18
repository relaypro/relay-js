import WebSocket, { OPEN } from 'ws'

import * as enums from './enums'

import { safeParse, makeId, filterInt, toString, arrayMapper, numberArrayMapper } from './utils'

import { PORT, HEARTBEAT, TIMEOUT, REFRESH_TIMEOUT, NOTIFICATION_TIMEOUT, EVENT_TIMEOUT } from './constants'
import {
  BaseCall, ButtonEvent, ConnectedCall, DisconnectedCall, FailedCall, ReceivedCall, StartedCall,
  NotificationEvent,
  NotificationOptions,
  IncidentEvent,
  LocalWebSocket,
  Options,
  Relay, Workflow,
  LedIndex,
  LedEffect,
  LedInfo,
  PlaceCall,
  Prompt,
  RingingCall,
  RegisterRequest,
  StopEvent,
  Mapper,
  AnyPrimitive,
  Msg,
} from './types'
import Queue from './queue'

const {
  Event,
  Language,
  DeviceInfoQuery,
  DeviceInfoField,
  Notification,
} = enums

export * from './enums'

type WorkflowEventHandlers = {
  [Event.ERROR]?: (error: Error) => Promise<void>,
  [Event.START]?: (event: Record<string, never>) => Promise<void>,
  [Event.STOP]?: (event: StopEvent) => Promise<void>,
  [Event.BUTTON]?: (event: ButtonEvent) => Promise<void>,
  [Event.TIMER]?: (event: Record<`name`, string>) => Promise<void>,
  [Event.NOTIFICATION]?: (event: NotificationEvent) => Promise<void>,
  [Event.INCIDENT]?: (event: IncidentEvent) => Promise<void>,
  [Event.PROMPT_START]?: (event: Prompt) => Promise<void>,
  [Event.PROMPT_STOP]?: (event: Prompt) => Promise<void>,
  [Event.CALL_RINGING]?: (event: RingingCall) => Promise<void>,
  [Event.CALL_CONNECTED]?: (event: ConnectedCall) => Promise<void>,
  [Event.CALL_DISCONNECTED]?: (event: DisconnectedCall) => Promise<void>,
  [Event.CALL_FAILED]?: (event: FailedCall) => Promise<void>,
  [Event.CALL_RECEIVED]?: (event: ReceivedCall) => Promise<void>,
  [Event.CALL_START_REQUEST]?: (event: StartedCall) => Promise<void>,
}

const createWorkflow = (fn: Workflow): Workflow => fn

const WORKFLOW_EVENT_REGEX = /^wf_api_(\w+)_event$/

type filter = (event: Msg) => boolean

const all: filter = () => true

class RelayEventAdapter {
  private websocket: LocalWebSocket | null = null
  private workQueue: Queue | null = null
  private handlers: WorkflowEventHandlers = {}
  private defaultLogParameters: Record<string, string|number|boolean> = {}

  constructor(websocket: LocalWebSocket) {
    console.log(`creating event adapter`)
    this.workQueue = new Queue()
    this.websocket = websocket
    this.websocket.on(`close`, this.onClose.bind(this))
    this.websocket.on(`error`, this.onError.bind(this))
    this.websocket.on(`message`, this.onMessage.bind(this))
  }

  on<U extends keyof WorkflowEventHandlers>(event: U, listener: WorkflowEventHandlers[U]): void {
    this.off(event)
    this.handlers[event] = listener
  }

  off<U extends keyof WorkflowEventHandlers>(event: U): void {
    const { [event]: handler, ...rest } = this.handlers
    if (handler) {
      this.handlers = rest
    }
  }

  private onClose(): void {
    this.websocket = null
  }

  private onError(error: Error): void {
    this.workQueue?.enqueue(async () => {
      if (this.handlers?.[Event.ERROR]) {
        try {
          await this.handlers?.[Event.ERROR]?.(error)
        } catch(err) {
          console.log(`\`error\` handler failed`)
          console.error(err)
        }
      } else { // if no handler, log
        console.error(error)
      }
    })
  }

  private onMessage(msg: string): void {
    const message = safeParse(msg)
    if (this.workQueue && message?._type && !message?._id) { // not interested in response events (marked by correlation id)
      const eventNameParts = message._type.match(WORKFLOW_EVENT_REGEX)
      if (eventNameParts?.[1]) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _type, ...args } = message
        this.workQueue?.enqueue(async () => {
          const event = eventNameParts?.[1] as keyof WorkflowEventHandlers
          try {
            await this.handlers?.[event]?.(args as never)
          } catch (err) {
            this.onError(err)
          }
        })
      } else {
        console.log(`Unknown message =>`, message)
      }
    }
  }

  private async _send(type: string, payload={}, id?: string): Promise<void|Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      if (!(this.websocket?.isAlive && this.websocket?.readyState === OPEN)) {
        console.error({
          isAlive: this.websocket?.isAlive,
          readyState: this.websocket?.readyState,
        })
        reject(new Error(`websocket-not-connected`))
        return
      }

      const message = {
        _id: id ?? makeId(),
        _type: `wf_api_${type}_request`,
        ...payload,
      }

      const messageStr = JSON.stringify(message)

      this.websocket.send(messageStr, (err) => {
        if (err) {
          reject(new Error(`failed-to-send`))
        } else {
          resolve()
        }
      })
    })
  }

  private async _sendReceive(type: string, payload={}, timeout=TIMEOUT): Promise<void|Record<string, unknown>> {
    const id = makeId()

    await this._send(type, payload, id)

    const event = await this._waitForEventCondition(
      (event: Msg) => {
        return ([`wf_api_${type}_response`, `wf_api_error_response`].includes(event._type)) && id === event._id
      },
      timeout
    )

    const { _id, _type, error, ...params } = event
    console.log(`processing event ${_id} of type ${_type}`)

    if (_type === `wf_api_${type}_response`) {
      return Object.keys(params).length > 0 ? params as Record<string, unknown> : undefined
    } else if (_type === `wf_api_error_response`) {
      throw new Error(error ?? `Unknown error`)
    } else {
      console.error(`Unknown response`, event)
      throw new Error(`Unknown response`)
    }
  }

  private async _waitForEventCondition(filter: filter=all, timeout=EVENT_TIMEOUT): Promise<Msg> {
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.websocket?.off?.(`message`, responseListener)
        reject(new Error(`failed-to-receive-event-timeout`))
      }, timeout)

      const responseListener = (msg: string) => {
        clearTimeout(timeoutHandle)
        const event = safeParse(msg)
        if (event) {
          if (filter(event)) {
            // stop listening as soon as we have a correlated response
            this.websocket?.off(`message`, responseListener)
            resolve(event)
          }
        }
      }
      // start listening to websocket messages for correlated response
      this.websocket?.on(`message`, responseListener)
    })
  }

  async _waitForEventAndOverride<U extends keyof WorkflowEventHandlers>(eventName: U): Promise<void> {
    const eventHandler = this.handlers[eventName]
    try {
      delete this.handlers[eventName]
      await this._waitForEventCondition(event => event._type === `wf_api_${eventName}_event`)
    } finally {
      if (eventHandler !== undefined) {
        this.handlers[eventName] = eventHandler
      }
    }
  }

  private async _cast(type: string, payload={}, timeout=TIMEOUT): Promise<void> {
    await this._sendReceive(type, payload, timeout)
  }

  private async _call(type: string, payload={}, timeout=TIMEOUT): Promise<Record<string, unknown>> {
    return (await this._sendReceive(type, payload, timeout)) as Record<string, unknown>
  }

  async setTimer(type: enums.TimerType, name: string, timeout=60, timeout_type: enums.TimeoutType): Promise<void> {
    await this._cast(`set_timer`, { type, name, timeout, timeout_type })
  }

  async clearTimer(name: string): Promise<void> {
    await this._cast(`clear_timer`, { name })
  }

  async restartDevice(): Promise<void> {
    await this._cast(`device_power_off`, { restart: true })
  }

  async powerDownDevice(): Promise<void> {
    await this._cast(`device_power_off`, { restart: false })
  }

  async say(text: string, lang=Language.ENGLISH): Promise<string> {
    const { id } = (await this._call(`say`, { text, lang })) as Record<`id`, string>
    return id
  }

  async sayAndWait(text: string, lang=Language.ENGLISH): Promise<string> {
    const id = await this.say(text, lang)
    await this._waitForEventAndOverride(Event.PROMPT_STOP)
    return id
  }

  async play(filename: string): Promise<string> {
    const { id } = (await this._call(`play`, { filename })) as Record<`id`, string>
    return id
  }

  async playAndWait(filename: string): Promise<string> {
    const id = await this.play(filename)
    await this._waitForEventAndOverride(Event.PROMPT_STOP)
    return id
  }

  async stopPlayback(id?: string|string[]): Promise<void> {
    if (Array.isArray(id)) {
      await this._cast(`stop_playback`, { ids: id })
    } else if (typeof id === `string`) {
      await this._cast(`stop_playback`, { ids: [id] })
    } else {
      await this._cast(`stop_playback`, {})
    }
  }

  async translate(text: string, from=Language.ENGLISH, to=Language.SPANISH): Promise<string> {
    const { text: translatedText } = (await this._call(`translate`, { text, from_lang: from, to_lang: to})) as Record<`text`, string>
    return translatedText
  }

  async vibrate(pattern: number[]): Promise<void> {
    await this._cast(`vibrate`, { pattern })
  }

  async switchLedOn(led: LedIndex, color: string): Promise<void> {
    await this.ledAction(`static`, { colors: { [`${led}`]: color } })
  }

  async switchAllLedOn(color: string): Promise<void> {
    await this.ledAction(`static`, { colors: { ring: color } })
  }

  async switchAllLedOff(): Promise<void> {
    await this.ledAction(`off`, {})
  }

  async rainbow(rotations=-1): Promise<void> {
    await this.ledAction(`rainbow`, { rotations })
  }

  async rotate(color=`FFFFFF`): Promise<void> {
    await this.ledAction(`rotate`, { rotations: -1, colors: { [`1`]: color } })
  }

  async flash(color=`0000FF`): Promise<void> {
    await this.ledAction(`flash`, { count: -1, colors: { ring: color } })
  }

  async breathe(color=`0000FF`): Promise<void> {
    await this.ledAction(`breathe`, { count: -1, colors: { ring: color } })
  }

  async ledAction(effect: LedEffect, args: LedInfo): Promise<void> {
    await this._cast(`set_led`, { effect, args })
  }

  private async _getDeviceInfo(query: enums.DeviceInfoQuery, refresh=false) {
    const response = await this._call(`get_device_info`, { query, refresh }, refresh ? REFRESH_TIMEOUT : TIMEOUT)  as Record<string, string|number|number[]>
    return response[query]
  }

  async getDeviceName(): Promise<string> {
    return await this._getDeviceInfo(DeviceInfoQuery.NAME) as string
  }

  async getDeviceLocation(refresh: boolean): Promise<string> {
    return await this._getDeviceInfo(DeviceInfoQuery.ADDRESS, refresh) as string
  }

  async getDeviceId(): Promise<string> {
    return await this._getDeviceInfo(DeviceInfoQuery.ID) as string
  }

  async getDeviceAddress(refresh: boolean): Promise<string> {
    return await this.getDeviceLocation(refresh)
  }

  async getDeviceCoordinates(refresh: boolean): Promise<number[]> {
    return await this._getDeviceInfo(DeviceInfoQuery.COORDINATES, refresh) as number[]
  }

  async getDeviceLatLong(refresh: boolean): Promise<number[]> {
    return await this.getDeviceCoordinates(refresh) as number[]
  }

  async getDeviceIndoorLocation(refresh: boolean): Promise<string> {
    return await this._getDeviceInfo(DeviceInfoQuery.INDOOR_LOCATION, refresh) as string
  }

  async getDeviceBattery(refresh: boolean): Promise<number> {
    return await this._getDeviceInfo(DeviceInfoQuery.BATTERY, refresh) as number
  }

  async getDeviceType(): Promise<enums.DeviceType> {
    return await this._getDeviceInfo(DeviceInfoQuery.TYPE) as enums.DeviceType
  }

  async getUserProfile(): Promise<string> {
    return await this._getDeviceInfo(DeviceInfoQuery.USERNAME) as string
  }

  async setUserProfile(username: string, force=false): Promise<void> {
    await this._cast(`set_user_profile`, { username, force })
  }

  private async setDeviceInfo(field: enums.DeviceInfoField, value: string): Promise<void> {
    await this._cast(`set_device_info`, { field, value })
  }

  async setDeviceName(name: string): Promise<void> {
    await this.setDeviceInfo(DeviceInfoField.LABEL, name)
  }

  async setDeviceChannel(channel: string): Promise<void> {
    await this.setDeviceInfo(DeviceInfoField.CHANNEL, channel)
  }

  async setDeviceMode(mode: `panic` | `alarm` | `none`): Promise<void>;
  async setDeviceMode(mode: `panic` | `alarm` | `none`, target?: string[]): Promise<void> {
    await this._cast(`set_device_mode`, { mode, target })
  }

  async setChannel(name:string, target: string[], { suppressTTS=false, disableHomeChannel=false }: { suppressTTS?: boolean, disableHomeChannel?: false }={}): Promise<void> {
    await this._cast(`set_channel`, { channel_name: name, target, suppress_tts: suppressTTS, disable_home_channel: disableHomeChannel })
  }

  async setHomeChannelState(target: string[], enabled: boolean): Promise<void> {
    await this._cast(`set_home_channel_state`, { target, enabled })
  }

  async getGroupMembers(groupName: string): Promise<string[]> {
    const { device_names } = await this._call(`list_group_members`, { group_name: groupName }) as Record<`device_names`, string[]>
    return device_names
  }

  async setDefaultLogParameters(params: Record<string, string|number|boolean>): Promise<void> {
    this.defaultLogParameters = params
  }

  async logEvent(event: string, parameters: Record<string, Record<string, string|number|boolean>>): Promise<void> {
    await this._cast(`log_message`, {
      name: event,
      content_type: `application/vnd.relay.event.parameters+json`,
      message: JSON.stringify({
        ...this.defaultLogParameters,
        ...parameters,
      })
    })
  }

  // async logUserEvent(event: string, target: string, parameters: Record<string, Record<string, string|number|boolean>>): Promise<void> {
  //   await this._cast(`log_message`, {
  //     name: event,
  //     content_type: `application/vnd.relay.event.parameters+json`,
  //     target,
  //     message: JSON.stringify({
  //       ...this.defaultLogParameters,
  //       ...parameters,
  //     })
  //   })
  // }

  async setVar(name: string, value: string): Promise<void> {
    await this._cast(`set_var`, { name, value: toString(value) })
  }

  async set(obj: Record<string, string>, value?: string): Promise<void> {
    if (typeof obj === `object`) {
      await Promise.all(
        Object.entries(obj)
          .map(([name, value]) => this.setVar(name, value))
      )
    } else if (value !== undefined) {
      await this.setVar(obj, value)
    }
  }

  async unsetVar(name: string): Promise<void> {
    await this._cast(`unset_var`, { name })
  }

  async unset(names: string|string[]): Promise<void> {
    if (Array.isArray(names)) {
      Promise.all(names.map(name => this.unsetVar(name)))
    } else {
      return this.unsetVar(names)
    }
  }

  async getQueryText(): Promise<string|undefined> {
    return this.getVar(`spillover`)
  }

  async getVar(name: string, defaultValue=undefined): Promise<string|undefined> {
    const result = await this._call(`get_var`, { name }) as Record<`value`, string>
    if (result === undefined) {
      return defaultValue
    } else {
      return result.value
    }
  }

  async getMappedVar<Type>(name: string, mapper: Mapper<Type>, defaultValue=undefined): Promise<Type|undefined> {
    const value = await this.getVar(name, defaultValue)
    if (value === undefined) {
      return value
    }
    return mapper(value)
  }

  async getNumberVar(name: string, defaultValue=undefined): Promise<number|undefined> {
    return await this.getMappedVar(name, Number, defaultValue)
  }

  async getArrayVar(name: string, defaultValue=undefined): Promise<string[]|undefined> {
    return await this.getMappedVar(name, arrayMapper, defaultValue)
  }

  async getNumberArrayVar(name: string, defaultValue=undefined): Promise<number[]|undefined> {
    return await this.getMappedVar(name, numberArrayMapper, defaultValue)
  }

  async get(names: string|string[], mappers: [Mapper<AnyPrimitive>]): Promise<AnyPrimitive | AnyPrimitive[]> {
    if (Array.isArray(names)) {
      if (Array.isArray(mappers) && names.length !== mappers.length) {
        throw new Error(`"get(names, mappers) array length are not equal`)
      }
      return Promise.all(names.map(async(name, index) =>  {
        const value = await this.getVar(name)
        if (value === undefined) {
          return value
        }
        const mapper = mappers?.[index] || String
        return mapper(value)
      }))
    } else {
      return this.getVar(names)
    }
  }

  async startTimer(timeout=60): Promise<void> {
    await this._cast(`start_timer`, { timeout })
  }

  async stopTimer(): Promise<void> {
    await this._cast(`stop_timer`)
  }

  private async _sendNotification(type: enums.Notification, text: undefined|string, target: string[], name?: string, pushOptions?: NotificationOptions): Promise<void> {
    await this._cast(`notification`, { type, name, text, target, push_opts: pushOptions }, NOTIFICATION_TIMEOUT)
  }

  async broadcast(name: string, text: string, target: string[], pushOptions?: NotificationOptions): Promise<void> {
    await this._sendNotification(Notification.BROADCAST, text, target, name, pushOptions)
  }

  async cancelBroadcast(name: string, target: string[]): Promise<void> {
    await this._sendNotification(Notification.CANCEL, undefined, target, name)
  }

  async notify(name: string, text: string, target: string[], pushOptions?: NotificationOptions): Promise<void> {
    await this._sendNotification(Notification.NOTIFY, text, target, name, pushOptions)
  }

  async cancelNotify(name: string, target: string[]): Promise<void> {
    await this._sendNotification(Notification.CANCEL, undefined, target, name)
  }

  async alert(name: string, text: string, target: string[], pushOptions?: NotificationOptions): Promise<void> {
    await this._sendNotification(Notification.ALERT, text, target, name, pushOptions)
  }

  async cancelAlert(name: string, target: string[]): Promise<void> {
    await this._sendNotification(Notification.CANCEL, undefined, target, name)
  }

  async listen(phrases=[], { transcribe=true, alt_lang=Language.ENGLISH, timeout=60 }={}): Promise<Record<`text`, string> | Record<`audio`, string>> {
    const response = await this._call(`listen`, { transcribe, phrases, timeout, alt_lang }, timeout * 1000)  as Record<`text`|`audio`, string>
    if (transcribe) {
      return { text: response.text } as Record<`text`, string>
    } else {
      return { audio: response.audio } as Record<`audio`, string>
    }
  }

  async createIncident(type: string): Promise<string> {
    const { incident_id } = await this._call(`create_incident`, { type })  as Record<`incident_id`, string>
    return incident_id
  }

  async resolveIncident(incidentId: string, reason: string): Promise<void> {
    await this._cast(`resolve_incident`, { incident_id: incidentId, reason })
  }

  async terminate(): Promise<void> {
    await this._cast(`terminate`)
  }

  private _buildCallIdRequestOrThrow(arg: string|BaseCall): BaseCall {
    if (typeof arg === `string`) {
      return { call_id: arg }
    } else if (typeof arg === `object`) {
      if (typeof arg.call_id === `string`) {
        return { call_id: arg.call_id }
      } else {
        throw new Error(`missing required parameter`)
      }
    } else {
      throw new Error(`invalid argument type`)
    }
  }

  async placeCall(call: PlaceCall): Promise<void> {
    await this._cast(`call`, call)
  }

  async answerCall(callRequest: string|BaseCall): Promise<void> {
    await this._cast(`answer`, this._buildCallIdRequestOrThrow(callRequest))
  }

  async hangupCall(callRequest: string|BaseCall): Promise<void> {
    await this._cast(`hangup`, this._buildCallIdRequestOrThrow(callRequest))
  }

  async register(request: RegisterRequest): Promise<void> {
    await this._cast(`register`, request)
  }

  async getUnreadInboxSize(): Promise<number> {
    const { count } = await this._call(`inbox_count`) as Record<`count`, string>
    return filterInt(count)
  }

  async playUnreadInboxMessages(): Promise<void> {
    await this._cast(`play_inbox_messages`)
  }
}

const DEFAULT_WORKFLOW = `__default_relay_workflow__`
let workflows: Map<string, Workflow> | null = null
let instances: Map<string, RelayEventAdapter> | null = null
let server: WebSocket.Server | null = null

const initializeRelaySdk = (options: Options={}): Relay => {
  if (workflows) {
    throw new Error(`Relay SDK already initialized`)
  } else {
    workflows = new Map()
    instances = new Map()

    const serverOptions = options.server ? { server: options.server } : { port: PORT }
    server = new WebSocket.Server(serverOptions, () => {
      console.log(`Relay SDK WebSocket Server listening => ${PORT}`)
    })

    server.shouldHandle = (request) => {
      if (request.url) {
        const path = request.url.slice(1)
        if (path) {
          return !!workflows?.has(path)
        } else {
          return !!workflows?.has(DEFAULT_WORKFLOW)
        }
      } else {
        return false
      }
    }

    server.on(`connection`, (websocket: LocalWebSocket, request) => {
      if (request.url && workflows) {
        const path = request.url.slice(1)
        const workflowName = workflows.has(path) ? path : DEFAULT_WORKFLOW

        const workflow = workflows.get(workflowName)

        if (workflow) {
          websocket.connectionId = `${workflowName}-${makeId()}`
          websocket.isAlive = true

          websocket.on(`pong`, () => {
            websocket.isAlive = true
          })

          websocket.on(`close`, (/*code, reason*/) => {
            console.info(`Workflow closed =>`, websocket.connectionId)
            instances?.delete(websocket.connectionId)
          })

          const adapter = new RelayEventAdapter(websocket)
          workflow(adapter)
          instances?.set(websocket.connectionId, adapter)
          console.info(`Workflow connection =>`, websocket.connectionId)
        } else {
          console.info(`Workflow not found; terminating websocket =>`, websocket.connectionId)
          websocket.terminate()
        }
      }
    })

    server.on(`error`, err => {
      console.error(err)
    })

    setInterval(() => {
      server?.clients.forEach((websocket) => {
        const _websocket = websocket as LocalWebSocket
        if (_websocket.isAlive === false) {
          return websocket.terminate()
        }
        _websocket.isAlive = false
        websocket.ping()
      })
    }, HEARTBEAT)

    return {
      workflow: (path: string|Workflow, workflow: Workflow) => {
        if (workflows) {
          if ((typeof path === `function`)) {
            console.info(`Default workflow set`)
            workflows.set(DEFAULT_WORKFLOW, path)
          } else if (typeof path === `string` && typeof workflow === `function`) {
            const strippedPath = path.replace(/^\/+/,``)
            workflows.set(strippedPath, workflow)
          } else {
            throw new Error(`First argument for workflow must either be a string or a function`)
          }
        }
      }
    }
  }
}

export {
  initializeRelaySdk as relay,
  createWorkflow,
}

export type { RelayEventAdapter, Event, Workflow, Relay, Language, Options }
