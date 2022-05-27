import { OPEN, RawData, Server } from 'ws'

import * as enums from './enums'

import { safeParse, makeId, filterInt, toString, arrayMapper, numberArrayMapper, isMatch } from './utils'

import { PORT, HEARTBEAT, TIMEOUT, REFRESH_TIMEOUT, NOTIFICATION_TIMEOUT, EVENT_TIMEOUT, NON_INTERACTIVE_ACTIONS, ERROR_RESPONSE, PROGRESS_EVENT } from './constants'
import {
  NotificationOptions,
  LocalWebSocket,
  Options,
  Relay, WorkflowEventHandler,
  LedIndex,
  LedEffect,
  LedInfo,
  RegisterRequest,
  Mapper,
  AnyPrimitive,
  TrackEventParameters,
  UnregisterRequest,
  InteractionOptions,
  Target,
  TargetUris,
  SingleTarget,
  SpeechEvent,
  BaseCallEvent,
  RawWorkflowEvent,
  WorkflowEventHandlers,
  WorkflowEvent,
  PlaceCall,
  ListenResponse,
  Maybe,
} from './types'
import Queue from './queue'
import * as Uri from './uri'
import RelayApi from './api'

const {
  Event,
  Language,
  DeviceInfoQuery,
  DeviceInfoField,
  Notification,
} = enums

export * from './enums'

NON_INTERACTIVE_ACTIONS

const createWorkflow = (fn: Workflow): Workflow => fn

const WORKFLOW_EVENT_REGEX = /^wf_api_(\w+)_event$/

type Filter = (event: RawWorkflowEvent) => boolean
// type Matches = {
//   request_id?: string,
//   id?: string,
// }

type Matches = Record<string, string|number|boolean>

const all: Filter = () => true

class Workflow {
  private websocket: LocalWebSocket | null = null
  private workQueue: Queue | null = null
  private handlers: WorkflowEventHandlers = {}
  private defaultAnalyticEventParameters: Record<string, string|number|boolean> = {}

  /**
   * @internal
   */
  constructor(websocket: LocalWebSocket) {
    console.log(`creating event adapter`)
    this.workQueue = new Queue()
    this.websocket = websocket
    this.websocket.on(`close`, this.onClose.bind(this))
    this.websocket.on(`error`, this.onError.bind(this))
    this.websocket.on(`message`, this.onMessage.bind(this))
  }

  on<U extends keyof WorkflowEventHandlers>(eventName: U, listener: WorkflowEventHandlers[U]): void {
    this.off(eventName)
    this.handlers[eventName] = listener
  }

  off<U extends keyof WorkflowEventHandlers>(eventName: U): void {
    const { [eventName]: handler, ...rest } = this.handlers
    if (handler) {
      this.handlers = rest
    }
  }

  private onClose(): void {
    this.websocket = null
  }

  private onError(error: unknown): void {
    this.workQueue?.enqueue(async () => {
      if (this.handlers?.[Event.ERROR]) {
        try {
          if (error instanceof Error) {
            await this.handlers?.[Event.ERROR]?.({ error })
          } else {
            console.log(`\`error\` not an instance of Error`)
            console.error(error)
          }
        } catch(err) {
          console.log(`\`error\` handler failed`)
          console.error(err)
        }
      } else { // if no handler, log
        console.error(error)
      }
    })
  }

  private onMessage(data: RawData, isBinary: boolean): void {
    if (isBinary) {
      console.warn(`Unexpected binary data over WebSocket`)
    } else {
      const message = safeParse(data.toString())
      console.log(`onMessage`, message)
      if (this.workQueue && message?._type && !message?._id) { // not interested in response events (marked by correlation id)
        const eventNameParts = message._type.match(WORKFLOW_EVENT_REGEX)
        if (eventNameParts?.[1]) {
          this.workQueue?.enqueue(async () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _type, ...args } = message
            let event = eventNameParts?.[1] as keyof WorkflowEventHandlers

            // if app doesn't explicity provide the broader `interaction_lifecycle`,
            // narrow to a specific interaction type handler
            if (event?.includes(`interaction_lifecycle`) && !this.handlers?.[event]) {
              event = `interaction_${message.type}` as keyof WorkflowEventHandlers
            }/* else if (event?.includes(`prompt`)) {
              event = `prompt_${message.type}` as keyof WorkflowEventHandlers
            }*/

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

  }

  private async _send(id: string, type: string, payload={}, target: TargetUris|undefined): Promise<void|Record<string, unknown>> {
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
        _id: id,
        _type: type,
        _target: target,
        ...payload,
      }

      const messageStr = JSON.stringify(message)

      console.info(`_send action =>`, message)

      this.websocket.send(messageStr, (err) => {
        if (err) {
          reject(new Error(`failed-to-send`))
        } else {
          resolve()
        }
      })
    })
  }

  private async _sendReceive(id: string, type: string, payload={}, timeout=TIMEOUT, targetUris: TargetUris|undefined): Promise<void | WorkflowEvent> {
    const typeBase = `wf_api_${type}`
    const typeRequest = `${typeBase}_request`
    const typeResponse = `${typeBase}_response`

    const filter = (event: RawWorkflowEvent) => ([typeResponse, ERROR_RESPONSE, PROGRESS_EVENT].includes(event._type)) && id === event._id

    await this._send(id, typeRequest, payload, targetUris)

    let event: Maybe<RawWorkflowEvent>
    // keep awaiting for event condition to match that ISN'T a progress event (actual response or error response)
    while (!event || event?._type === PROGRESS_EVENT) {
      event = await this._waitForEventCondition(filter, timeout)
    }

    const { _id, _type, error, ...params } = event
    console.log(`processing event ${_id} of type ${_type}`)
    // console.info(`_sendReceive action response =>`, event)

    if (_type === typeResponse) {
      return Object.keys(params).length > 0 ? params as WorkflowEvent : undefined
    } else if (_type === ERROR_RESPONSE) {
      if (error instanceof Error) {
        throw error
      } else if (typeof error === `string`) {
        throw new Error(error)
      } else {
        throw new Error(`Unknown error`)
      }
    } else {
      console.error(`Unknown response`, event)
      throw new Error(`Unknown response`)
    }
  }

  private async _waitForEventCondition(filter: Filter=all, timeout=EVENT_TIMEOUT): Promise<RawWorkflowEvent> {
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.websocket?.off?.(`message`, responseListener)
        reject(new Error(`failed-to-receive-event-timeout`))
      }, timeout)

      const responseListener = (msg: string) => {
        const event = safeParse(msg)
        console.info(`_waitForEventCondition#responseListener =>`, event)
        if (event) {
          if (filter(event)) {
            // stop listening as soon as we have a correlated response
            clearTimeout(timeoutHandle)
            this.websocket?.off?.(`message`, responseListener)
            resolve(event)
          }
        }
      }
      // start listening to websocket messages for correlated response
      this.websocket?.on?.(`message`, responseListener)
    })
  }

  // TODO: should I save off eventHandler?
  private async _waitForEventMatch<U extends keyof WorkflowEventHandlers>(eventName: U, matches: Matches={}): Promise<RawWorkflowEvent> {
    const eventHandler = this.handlers[eventName]
    try {
      delete this.handlers[eventName]
      // match event name and matching object
      return this._waitForEventCondition(event => {
        const _matches = { _type: `wf_api_${eventName}_event`, ...matches }
        const doesMatch = isMatch(event, _matches)
        console.log(`_waitForEventCondition`, { event, eventName, _matches, doesMatch  })
        return doesMatch
      })
    } finally {
      if (eventHandler !== undefined) {
        this.handlers[eventName] = eventHandler
      }
    }
  }

  private async _cast(type: string, payload={}, timeout=TIMEOUT): Promise<void> {
    await this._sendReceive(makeId(), type, payload, timeout, undefined)
  }

  private async _castTargetWithId(id: string, target: Target, type: string, payload={}, timeout=TIMEOUT): Promise<void> {
    await this._sendReceive(id, type, payload, timeout, Uri.makeTargetUris(target))
  }

  private async _castTarget(target: Target, type: string, payload={}, timeout=TIMEOUT): Promise<void> {
    /*
      if (NON_INTERACTIVE_ACTIONS.includes(_type)) {
        if (target === undefined || target.uris.every(t => ))
      }
    */
    await this._sendReceive(makeId(), type, payload, timeout, Uri.makeTargetUris(target))
  }

  // private async _castInteractiveTarget(target: Target, type: string, payload={}, timeout=TIMEOUT): Promise<void> {
  //   if (NON_INTERACTIVE_ACTIONS.includes(type)) {
  //     throw new Error(`action-type-not-interactive => ${type}`)
  //   } else if (false) {

  //     // dfd
  //   } else {
  //     await this._sendReceive(type, payload, timeout, Uri.makeTargetUris(target))
  //   }
  // }

  private async _call(type: string, payload={}, timeout=TIMEOUT): Promise<Record<string, unknown>> {
    return (await this._sendReceive(makeId(), type, payload, timeout, undefined)) as Record<string, unknown>
  }

  private async _callTarget(target: Target, type: string, payload={}, timeout=TIMEOUT): Promise<Record<string, unknown>> {
    return (await this._sendReceive(makeId(), type, payload, timeout, Uri.makeTargetUris(target))) as Record<string, unknown>
  }

  // START TARGETED ACTIONS

  // START MULTI-TARGET ACTIONS
  // FOLLOWING ACTIONS __DO__ REQUIRE TARGET
  // THEY MUST RUN IN THE CONTEXT OF AN INTERACTION

  async startInteraction(target: Target, name: string, options: InteractionOptions): Promise<void> {
    await this._castTarget(target, `start_interaction`, { name, options })
  }

  async say(target: Target, text: string, lang=Language.ENGLISH): Promise<string> {
    const { id } = (await this._callTarget(target, `say`, { text, lang })) as Record<`id`, string>
    return id
  }

  async sayAndWait(target: Target, text: string, lang=Language.ENGLISH): Promise<string> {
    const id = await this.say(target, text, lang)
    await this._waitForEventMatch(Event.PROMPT, { id, type: `stopped` })
    return id
  }

  async play(target: Target, filename: string): Promise<string> {
    const { id } = (await this._callTarget(target, `play`, { filename })) as Record<`id`, string>
    return id
  }

  async playAndWait(target: Target, filename: string): Promise<string> {
    const id = await this.play(target, filename)
    await this._waitForEventMatch(Event.PROMPT, { id, type: `stopped` })
    return id
  }

  // async stopPlayback(id?: string|string[]): Promise<void> {
  //   if (Array.isArray(id)) {
  //     await this._cast(`stop_playback`, { ids: id })
  //   } else if (typeof id === `string`) {
  //     await this._cast(`stop_playback`, { ids: [id] })
  //   } else {
  //     await this._cast(`stop_playback`, {})
  //   }
  // }

  async vibrate(target: Target, pattern: number[]): Promise<void> {
    await this._castTarget(target, `vibrate`, { pattern })
  }

  async switchLedOn(target: Target, led: LedIndex, color: string): Promise<void> {
    await this.ledAction(target, `static`, { colors: { [`${led}`]: color } })
  }

  async switchAllLedOn(target: Target, color: string): Promise<void> {
    await this.ledAction(target, `static`, { colors: { ring: color } })
  }

  async switchAllLedOff(target: Target): Promise<void> {
    await this.ledAction(target, `off`, {})
  }

  async rainbow(target: Target, rotations=-1): Promise<void> {
    await this.ledAction(target, `rainbow`, { rotations })
  }

  async rotate(target: Target, color=`FFFFFF`): Promise<void> {
    await this.ledAction(target, `rotate`, { rotations: -1, colors: { [`1`]: color } })
  }

  async flash(target: Target, color=`0000FF`): Promise<void> {
    await this.ledAction(target, `flash`, { count: -1, colors: { ring: color } })
  }

  async breathe(target: Target, color=`0000FF`): Promise<void> {
    await this.ledAction(target, `breathe`, { count: -1, colors: { ring: color } })
  }

  async ledAction(target: Target, effect: LedEffect, args: LedInfo): Promise<void> {
    await this._castTarget(target, `set_led`, { effect, args })
  }

  async enableHomeChannel(target: Target): Promise<void> {
    await this._setHomeChannelState(target, true)
  }

  async disableHomeChannel(target: Target): Promise<void> {
    await this._setHomeChannelState(target, false)
  }

  private async _setHomeChannelState(target: Target, enabled: boolean): Promise<void> {
    await this._castTarget(target, `set_home_channel_state`, { enabled })
  }

  private async _sendNotification(target: Target, originator: SingleTarget|undefined, type: enums.Notification, text: undefined|string, name?: string, pushOptions?: NotificationOptions): Promise<void> {
    await this._castTarget(target, `notification`, { originator, type, name, text, push_opts: pushOptions }, NOTIFICATION_TIMEOUT)
  }

  async broadcast(target: Target, originator: SingleTarget, name: string, text: string, pushOptions?: NotificationOptions): Promise<void> {
    await this._sendNotification(target, originator, Notification.BROADCAST, text, name, pushOptions)
  }

  async cancelBroadcast(target: Target, name: string): Promise<void> {
    await this._sendNotification(target, undefined, Notification.CANCEL, undefined, name)
  }

  async notify(target: Target, originator: SingleTarget, name: string, text: string, pushOptions?: NotificationOptions): Promise<void> {
    await this._sendNotification(target, originator, Notification.NOTIFY, text, name, pushOptions)
  }

  async cancelNotify(target: Target,name: string): Promise<void> {
    await this._sendNotification(target, undefined, Notification.CANCEL, undefined, name)
  }

  async alert(target: Target, originator: SingleTarget, name: string, text: string, pushOptions?: NotificationOptions): Promise<void> {
    await this._sendNotification(target, originator, Notification.ALERT, text, name, pushOptions)
  }

  async cancelAlert(target: Target, name: string): Promise<void> {
    await this._sendNotification(target, undefined, Notification.CANCEL, undefined, name)
  }

  async restartDevice(target: Target): Promise<void> {
    await this._castTarget(target, `device_power_off`, { restart: true })
  }

  async powerDownDevice(target: Target): Promise<void> {
    await this._castTarget(target, `device_power_off`, { restart: false })
  }

  // END MULTI-TARGET ACTIONS

  // START SINGLE-TARGET ACTIONS

  private async _getDeviceInfo(target: SingleTarget, query: enums.DeviceInfoQuery, refresh=false) {
    const response = await this._callTarget(target, `get_device_info`, { query, refresh }, refresh ? REFRESH_TIMEOUT : TIMEOUT)  as Record<string, string|number|number[]|boolean>
    return response[query]
  }

  // TODO: is this action necessary?
  async getUserProfile(target: SingleTarget): Promise<string> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.USERNAME) as string
  }

  // TODO: is `username` a URI?
  async setUserProfile(target: SingleTarget, username: string, force=false): Promise<void> {
    await this._castTarget(target, `set_user_profile`, { username, force })
  }

  // TODO: is this action necessary?
  async getDeviceName(target: SingleTarget): Promise<string> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.NAME) as string
  }

  // TODO: is this action necessary?
  async getDeviceId(target: SingleTarget): Promise<string> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.ID) as string
  }

  async getDeviceLocation(target: SingleTarget, refresh: boolean): Promise<string> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.ADDRESS, refresh) as string
  }

  async getDeviceLocationEnabled(target: SingleTarget): Promise<boolean> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.LOCATION_ENABLED) as boolean
  }

  async getDeviceAddress(target: SingleTarget, refresh: boolean): Promise<string> {
    return await this.getDeviceLocation(target, refresh)
  }

  async getDeviceCoordinates(target: SingleTarget, refresh: boolean): Promise<number[]> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.COORDINATES, refresh) as number[]
  }

  async getDeviceLatLong(target: SingleTarget, refresh: boolean): Promise<number[]> {
    return await this.getDeviceCoordinates(target, refresh) as number[]
  }

  async getDeviceIndoorLocation(target: SingleTarget, refresh: boolean): Promise<string> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.INDOOR_LOCATION, refresh) as string
  }

  async getDeviceBattery(target: SingleTarget, refresh: boolean): Promise<number> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.BATTERY, refresh) as number
  }

  async getDeviceType(target: SingleTarget): Promise<enums.DeviceType> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.TYPE) as enums.DeviceType
  }

  private async setDeviceInfo(target: SingleTarget, field: enums.DeviceInfoField, value: string): Promise<void> {
    await this._castTarget(target, `set_device_info`, { field, value })
  }

  async setDeviceName(target: SingleTarget, name: string): Promise<void> {
    await this.setDeviceInfo(target, DeviceInfoField.LABEL, name)
  }

  // TODO: is channel a URI?
  async setDeviceChannel(target: SingleTarget, channel: string): Promise<void> {
    await this.setDeviceInfo(target, DeviceInfoField.CHANNEL, channel)
  }

  // TODO: wf_api_set_device_info_request's location_enabled string booleans?
  async enableLocation(target: SingleTarget): Promise<void> {
    await this.setDeviceInfo(target, DeviceInfoField.LOCATION_ENABLED, `true`)
  }

  async disableLocation(target: SingleTarget): Promise<void> {
    await this.setDeviceInfo(target, DeviceInfoField.LOCATION_ENABLED, `false`)
  }

  async setDeviceMode(target: SingleTarget, mode: `panic` | `alarm` | `none`): Promise<void> {
    await this._castTarget(target, `set_device_mode`, { mode })
  }

  async setChannel(target: SingleTarget, name:string, { suppressTTS=false, disableHomeChannel=false }: { suppressTTS?: boolean, disableHomeChannel?: false }={}): Promise<void> {
    await this._castTarget(target, `set_channel`, { channel_name: name, suppress_tts: suppressTTS, disable_home_channel: disableHomeChannel })
  }

  async listen(target: SingleTarget, phrases=[], { transcribe=true, alt_lang=Language.ENGLISH, timeout=60 }={}): Promise<ListenResponse> {
    const request_id = makeId()
    await this._castTargetWithId(request_id, target, `listen`, {
      transcribe,
      phrases,
      timeout,
      alt_lang,
    }, timeout * 1000)

    const response = await this._waitForEventMatch(Event.SPEECH, { request_id }) as SpeechEvent

    console.log(`listen`, response)

    if (transcribe) {
      return { text: response.text, lang: response.lang }
    } else {
      return { audio: response.audio }
    }
  }

  private _buildCallIdRequestOrThrow(arg: string | BaseCallEvent): BaseCallEvent {
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

  async placeCall(target: SingleTarget, call: PlaceCall): Promise<void> {
    await this._castTarget(target, `call`, call)
  }

  async answerCall(target: SingleTarget, callRequest: string | BaseCallEvent): Promise<void> {
    await this._castTarget(target, `answer`, this._buildCallIdRequestOrThrow(callRequest))
  }

  async hangupCall(target: SingleTarget, callRequest: string | BaseCallEvent): Promise<void> {
    await this._castTarget(target, `hangup`, this._buildCallIdRequestOrThrow(callRequest))
  }

  async registerForCalls(target: SingleTarget, request: RegisterRequest): Promise<void> {
    await this._castTarget(target, `register`, request)
  }

  async unregisterForCalls(target: SingleTarget, request: UnregisterRequest): Promise<void> {
    await this.registerForCalls(target, { ...request, expires: 0 })
  }

  async getUnreadInboxSize(target: SingleTarget): Promise<number> {
    const { count } = await this._callTarget(target, `inbox_count`) as Record<`count`, string>
    return filterInt(count)
  }

  async playUnreadInboxMessages(target: SingleTarget): Promise<void> {
    await this._castTarget(target, `play_inbox_messages`)
  }

  // END SINGLE-TARGET ACTIONS

  // END TARGETED ACTIONS

  // START NON-TARGETED ACTIONS
  // FOLLOWING ACTIONS __DO NOT__ REQUIRE TARGET
  // THEY RUN IN THE CONTEXT OF THE WORKFLOW
  // AND NOT AN INTERACTION / CHANNEL

  async setTimer(type: enums.TimerType, name: string, timeout=60, timeout_type: enums.TimeoutType): Promise<void> {
    await this._cast(`set_timer`, { type, name, timeout, timeout_type })
  }

  async clearTimer(name: string): Promise<void> {
    await this._cast(`clear_timer`, { name })
  }

  async translate(text: string, from=Language.ENGLISH, to=Language.SPANISH): Promise<string> {
    const { text: translatedText } = (await this._call(`translate`, { text, from_lang: from, to_lang: to})) as Record<`text`, string>
    return translatedText
  }

  // TODO: is group_name a URI?
  // TODO: should device_uris be pre-parsed out for simple values instead of URNs?
  async getGroupMembers(groupName: string): Promise<string[]> {
    const { device_uris } = await this._call(`list_group_members`, { group_name: groupName }) as Record<`device_uris`, string[]>
    return device_uris
  }

  async setDefaultAnalyticEventParameters(params: Record<string, string|number|boolean>): Promise<void> {
    this.defaultAnalyticEventParameters = params
  }

  async logMessage(message: string, category=`default`): Promise<void> {
    await this._cast(`log_analytics_event`, {
      category,
      content_type: `text/plain`,
      content: message,
    })
  }

  async logUserMessage(message: string, target: SingleTarget, category=`default`): Promise<void> {
    await this._cast(`log_analytics_event`, {
      device_uri: target,
      category,
      content_type: `text/plain`,
      content: message,
    })
  }

  async trackEvent(category: string, parameters?: TrackEventParameters): Promise<void> {
    await this._cast(`log_analytics_event`, {
      category,
      content_type: `application/vnd.relay.event.parameters+json`,
      content: {
        ...this.defaultAnalyticEventParameters,
        ...parameters,
      }
    })
  }

  async trackUserEvent(category: string, target: SingleTarget, parameters?: TrackEventParameters): Promise<void> {
    await this._cast(`log_analytics_event`, {
      device_uri: target,
      category,
      content_type: `application/vnd.relay.event.parameters+json`,
      analytics_content: {
        ...this.defaultAnalyticEventParameters,
        ...parameters,
      }
    })
  }

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

  async createIncident(originatorUri: SingleTarget, type: string): Promise<string> {
    const { incident_id } = await this._call(`create_incident`, { type, originator_uri: originatorUri })  as Record<`incident_id`, string>
    return incident_id
  }

  async resolveIncident(incidentId: string, reason: string): Promise<void> {
    await this._cast(`resolve_incident`, { incident_id: incidentId, reason })
  }

  async terminate(): Promise<void> {
    await this._cast(`terminate`)
  }

  // END NON-TARGETED ACTIONS

}

const DEFAULT_WORKFLOW = `__default_relay_workflow__`
let workflows: Map<string, WorkflowEventHandler> | null = null
let instances: Map<string, Workflow> | null = null
let server: Server | null = null

const initializeRelaySdk = (options: Options={}): Relay => {
  if (workflows) {
    throw new Error(`Relay SDK already initialized`)
  } else {
    workflows = new Map()
    instances = new Map()

    const serverOptions = options.server ? { server: options.server } : { port: PORT }
    server = new Server(serverOptions, () => {
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

          const _workflow = new Workflow(websocket)
          workflow(_workflow)
          instances?.set(websocket.connectionId, _workflow)
          console.info(`Workflow connection =>`, websocket.connectionId)
        } else {
          console.info(`Workflow not found; terminating websocket =>`, websocket.connectionId)
          websocket.terminate()
        }
      }
    })

    server.on(`error`, (err: Error) => {
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

    const api = new RelayApi(options.subscriberId, options.apiKey)

    return {
      workflow: (path: string|WorkflowEventHandler, workflow?: WorkflowEventHandler) => {
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
      },
      api,
    }
  }
}

export {
  initializeRelaySdk as relay,
  createWorkflow,
  Uri,
}

export type { WorkflowEventHandler, Event, Workflow, Relay, Language, Options }
