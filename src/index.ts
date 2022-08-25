// Copyright © 2022 Relay Inc.

import { OPEN, RawData, Server } from 'ws'

import * as enums from './enums'

import { safeParse, makeId, filterInt, toString, arrayMapper, numberArrayMapper, isMatch } from './utils'

import { HEARTBEAT, TIMEOUT, REFRESH_TIMEOUT, NOTIFICATION_TIMEOUT, EVENT_TIMEOUT, NON_INTERACTIVE_ACTIONS, ERROR_RESPONSE, PROGRESS_EVENT } from './constants'
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
  GroupTarget,
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

import debugFn from 'debug'
const debug = debugFn(`relay:core`)

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

/**
 * The Workflow class is responsible for defining the main functionalities that are used within workflows,
 * such as functions for communicating with the device, sending out
 * notifications to groups, handling workflow events, and performing physical actions
 * on the device such as manipulating LEDs and creating vibrations.
 */
class Workflow {
  private websocket: LocalWebSocket | null = null
  private workQueue: Queue | null = null
  private handlers: WorkflowEventHandlers = {}
  private defaultAnalyticEventParameters: Record<string, string|number|boolean> = {}

  /**
   * @internal
   */
  constructor(websocket: LocalWebSocket) {
    debug(`creating event adapter`)
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
            debug(`\`error\` not an instance of Error`, error)
          }
        } catch(err) {
          debug(`\`error\` handler failed`, err)
        }
      } else { // if no handler, log
        debug(`no error handler`, error)
      }
    })
  }

  private onMessage(data: RawData, isBinary: boolean): void {
    if (isBinary) {
      debug(`Unexpected binary data over WebSocket`)
    } else {
      const message = safeParse(data.toString())
      debug(`onMessage`, message)
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
            } else if (event?.includes(`start`)) {
              // protocol is to send sdk info to ibot upon receiving the start event
              this._logSdkInfo()
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
          debug(`Unknown message =>`, message)
        }
      }
    }

  }

  private async _send(id: string, type: string, payload={}, target: TargetUris|undefined): Promise<void|Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      if (!(this.websocket?.isAlive && this.websocket?.readyState === OPEN)) {
        debug({
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

      debug(`_send action =>`, message)

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
    debug(`processing event ${_id} of type ${_type}`)

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
      debug(`Unknown response`, event)
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
        debug(`_waitForEventCondition#responseListener =>`, event)
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
        debug(`_waitForEventCondition`, { event, eventName, _matches, doesMatch  })
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

  /**
   * Starts an interaction with the user.  Triggers an INTERACTION_STARTED event
   * and allows the user to interact with the device via functions that require an
   * interaction URN.
   * @param target the device that you would like to start an interaction with.
   * @param name a name for your interaction.
   * @param options can be color, home channel, or input types.
   */
  async startInteraction(target: Target, name: string, options: InteractionOptions): Promise<void> {
    await this._castTarget(target, `start_interaction`, { name, options })
  }

  /**
   * Ends an interaction with the user.  Triggers an INTERACTION_ENDED event to signify
   * that the user is done interacting with the device.
   * @param target the device that you would like to end an interaction with.
   * @param name the name of the interaction that you would like to end.
   */
  async endInteraction(target: Target, name: string): Promise<void> {
    await this._castTarget(target, `end_interaction`, { name })
  }

  /**
   * Utilizes text to speech capabilities to make the device 'speak' to the user.
   * @param target the interaction URN.
   * @param text what you would like the device to say.
   * @param lang the language of the text that is being spoken.  Defaults to 'en-US'.
   * @returns the response ID after the device speaks to the user.
   */
  async say(target: Target, text: string, lang=Language.ENGLISH): Promise<string> {
    const { id } = (await this._callTarget(target, `say`, { text, lang })) as Record<`id`, string>
    return id
  }

  /**
   * Utilizes text to speech capabilities to make the device 'speak' to the user.
   * Waits until the text is fully played out on the device before continuing.
   * @param target the interaction URN.
   * @param text what you would like the device to say.
   * @param lang the language of the text that is being spoken.  Defaults to 'en-US'.
   * @returns the response ID after the device speaks to the user.
   */
  async sayAndWait(target: Target, text: string, lang=Language.ENGLISH): Promise<string> {
    const id = await this.say(target, text, lang)
    await this._waitForEventMatch(Event.PROMPT, { id, type: `stopped` })
    return id
  }

  /**
   * Plays a custom audio file that was uploaded by the user.
   * @param target the interaction URN.
   * @param filename the name of the audio file.
   * @returns the response ID after the audio file has been played on the device.
   */
  async play(target: Target, filename: string): Promise<string> {
    const { id } = (await this._callTarget(target, `play`, { filename })) as Record<`id`, string>
    return id
  }

  /**
   * Plays a custom audio file that was uploaded by the user.  Waits until the audio
   * file has finished playing before continuing through the workflow.
   * @param target the interaction URN.
   * @param filename the name of the audio file.
   * @returns the response ID after the audio file has been played on the device.
   */
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

  /**
   * Makes the device vibrate in a particular pattern.  You can specify
   * how many vibrations you would like, the duration of each vibration in
   * milliseconds, and how long you would like the pauses between each vibration to last
   * in milliseconds.
   * @param target the interaction URN.
   * @param pattern an array representing the pattern of your vibration.  Defaults to none.
   */
  async vibrate(target: Target, pattern: number[]): Promise<void> {
    await this._castTarget(target, `vibrate`, { pattern })
  }

  /**
   * Switches on an LED at a particular index to a specified color.
   * @param target the interaction URN.
   * @param led the index of an LED, numbered 1-12.
   * @param color the hex color code that you would like to set the LED to.
   */
  async switchLedOn(target: Target, led: LedIndex, color: string): Promise<void> {
    await this.ledAction(target, `static`, { colors: { [`${led}`]: color } })
  }

  /**
   * Switches all of the LEDs on a device on to a specified color.
   * @param target the interaction URN.
   * @param color the hex color code you would like the LEDs to be.
   */
  async switchAllLedOn(target: Target, color: string): Promise<void> {
    await this.ledAction(target, `static`, { colors: { ring: color } })
  }

  /**
   * Switches all of the LEDs on a device off.
   * @param target the interaction URN.
   */
  async switchAllLedOff(target: Target): Promise<void> {
    await this.ledAction(target, `off`, {})
  }

  /**
   * Switches all of the LEDs on to a configured rainbow pattern and rotates the rainbow
   * a specified number of times.
   * @param target the interaction URN.
   * @param rotations the number of times you would like the rainbow to rotate. Defaults to -1, meaning the
   * rainbow will rotate indefinitely.
   */
  async rainbow(target: Target, rotations=-1): Promise<void> {
    await this.ledAction(target, `rainbow`, { rotations })
  }

  //TODO  This does not have the number of rotations has a parameter.
  /**
   * Switches all of the LEDs on a device to a certain color and rotates them a specified number
   * of times.
   * @param target the interaction URN.
   * @param color the hex color code you would like to turn the LEDs to. Defaults to 'FFFFFF'.
   */
  async rotate(target: Target, color=`FFFFFF`): Promise<void> {
    await this.ledAction(target, `rotate`, { rotations: -1, colors: { [`1`]: color } })
  }

  // TODO this does not have a count parameter.
  /**
   * Switches all of the LEDs on a device to a certain color and flashes them
   * a specified number of times.
   * @param target the interaction URN.
   * @param color the hex color code you would like to turn the LEDs to. Defaults to '0000FF'.
   */
  async flash(target: Target, color=`0000FF`): Promise<void> {
    await this.ledAction(target, `flash`, { count: -1, colors: { ring: color } })
  }

  /**
   * Switches all of the LEDs on a device to a certain color and creates a 'breathing' effect,
   * where the LEDs will slowly light up a specified number of times.
   * @param target the interaction URN.
   * @param color the hex color code you would like to turn the LEDs to. Defaults to '0000FF'.
   */
  async breathe(target: Target, color=`0000FF`): Promise<void> {
    await this.ledAction(target, `breathe`, { count: -1, colors: { ring: color } })
  }

  /**
   * Used for performing actions on the LEDs, such as creating
   * a rainbow, flashing, rotating, etc.
   * @param target the interaction URN.
   * @param effect effect to perform on LEDs, can be 'rainbow', 'rotate', 'flash', 'breath', 'static', or 'off'.
   * @param args optional arguments for LED actions.  Defauls to None.
   */
  async ledAction(target: Target, effect: LedEffect, args: LedInfo): Promise<void> {
    await this._castTarget(target, `set_led`, { effect, args })
  }

  /**
   * Sets the home channel state on the device to true.
   * @param target the device URN whose home channel you would like to set.
   */
  async enableHomeChannel(target: Target): Promise<void> {
    await this._setHomeChannelState(target, true)
  }

  /**
   * Sets the home channel state on the device to false.
   * @param target the device URN whose home channel you would like to set.
   */
  async disableHomeChannel(target: Target): Promise<void> {
    await this._setHomeChannelState(target, false)
  }

  /**
   * Used by enable/disable home channel methods to set the home
   * channel state on the device to either true of false.
   * @param target the device URN.
   * @param enabled whether or not you would like to enable the home channel state.
   */
  private async _setHomeChannelState(target: Target, enabled: boolean): Promise<void> {
    await this._castTarget(target, `set_home_channel_state`, { enabled })
  }

  /**
   * Used by notification methods to send out a notification to a group of devices.
   * @param target the group URN that you are sending your message to.
   * @param originator the device or interacion URN that sent out the message.
   * @param type the type of notification.  Can be either 'broadcast', 'notification', or 'alert'.
   * @param text the content of your notification.
   * @param name the name of your notification.
   * @param pushOptions push options for if the notification is sent to the Relay App on a virtual device.
   */
  private async _sendNotification(target: Target, originator: SingleTarget|undefined, type: enums.Notification, text: undefined|string, name?: string, pushOptions?: NotificationOptions): Promise<void> {
    await this._castTarget(target, `notification`, { originator, type, name, text, push_opts: pushOptions ?? {} }, NOTIFICATION_TIMEOUT)
  }

  /**
   * Sends out a broadcasted message to a group of devices.  The message is played out on
   * all devices, as well as sent to the Relay Dash.
   * @param target the group URN that you would like to broadcast your message to.
   * @param originator the device URN that triggered the broadcast.
   * @param name a name for your broadcast.
   * @param text the text that you would like to be broadcasted to your group.
   * @param pushOptions push options for if the broadcast is sent to the Relay App on a virtual device.  Defaults to {}.
   */
  async broadcast(target: Target, originator: SingleTarget, name: string, text: string, pushOptions?: NotificationOptions): Promise<void> {
    await this._sendNotification(target, originator, Notification.BROADCAST, text, name, pushOptions)
  }

  /**
   * Cancels the broadcast that was sent to a group of devices.
   * @param target the device URN that is cancelling the broadcast.
   * @param name the name of the broadcast that you would like to cancel.
   */
  async cancelBroadcast(target: Target, name: string): Promise<void> {
    await this._sendNotification(target, undefined, Notification.CANCEL, undefined, name)
  }

  /**
   * Sends out an alert to the specified group of devices and the Relay Dash.
   * @param target the group URN that you would like to send an alert to.
   * @param originator the URN of the device that triggered the alert.
   * @param name a name for your alert.
   * @param text the text that you would like to be spoken to the group as your alert.
   * @param pushOptions push options for if the alert is sent to the Relay app on a virtual device. Defaults to {}.
   */
  async alert(target: Target, originator: SingleTarget, name: string, text: string, pushOptions?: NotificationOptions): Promise<void> {
    await this._sendNotification(target, originator, Notification.ALERT, text, name, pushOptions)
  }

  /**
   * Cancels an alert that was sent to a group of devices.  Particularly useful if you would like to cancel the alert
   * on all devices after one device has acknowledged the alert.
   * @param target the device URN that has acknowledged the alert.
   * @param name the name of the alert.
   */
  async cancelAlert(target: Target, name: string): Promise<void> {
    await this._sendNotification(target, undefined, Notification.CANCEL, undefined, name)
  }

  // RESTARTING/POWERING DOWN THE DEVICE CURRENTLY DO NOT WORK

  // /**
  //  * Restarts a device during a workflow, without having
  //  * to physically restart the device via hodling down the '-' button.
  //  * @param target the URN of the device you would like to restart.
  //  */
  // async restartDevice(target: Target): Promise<void> {
  //   await this._castTarget(target, `device_power_off`, { restart: true })
  // }

  // /**
  //  * Powers down a device during a workflow, without having to physically power down
  //  * the device via holding down the '+' button.
  //  * @param target the URN of the device that you would like to power down.
  //  */
  // async powerDownDevice(target: Target): Promise<void> {
  //   await this._castTarget(target, `device_power_off`, { restart: false })
  // }

  // END MULTI-TARGET ACTIONS

  // START SINGLE-TARGET ACTIONS

  /**
   * Used privately by device information functions to retrieve varying information
   * on the device, such as the ID, location, battery, name and type.
   * @param target the device or interaction URN.
   * @param query which category of information you are retrieving.
   * @param refresh whether to refresh before retrieving information on the device.
   * @returns information on the device based on the query.
   */
  private async _getDeviceInfo(target: SingleTarget, query: enums.DeviceInfoQuery, refresh=false) {
    const response = await this._callTarget(target, `get_device_info`, { query, refresh }, refresh ? REFRESH_TIMEOUT : TIMEOUT)  as Record<string, string|number|number[]|boolean>
    return response[query]
  }

  // TODO: is this action necessary?
  /**
   * Returns the user profile of a targeted device
   * @param target the device or interaction URN.
   * @returns the user profile registered to the device.
   */
  async getUserProfile(target: SingleTarget): Promise<string> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.USERNAME) as string
  }

  // TODO: is `username` a URI?
  /**
   * Sets the profile of a user by updating the username.
   * @param target the device URN whose profile you would like to update.
   * @param username the updated username for the device.
   * @param force whether you would like to force this update.  Defaults to false.
   */
  async setUserProfile(target: SingleTarget, username: string, force=false): Promise<void> {
    await this._castTarget(target, `set_user_profile`, { username, force })
  }

  // TODO: is this action necessary?
  /**
   * Returns the name of a targeted device.
   * @param target the device or interaction URN.
   * @returns the name of the device.
   */
  async getDeviceName(target: SingleTarget): Promise<string> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.NAME) as string
  }

  // TODO: is this action necessary?
  /**
   * Returns the ID of a targeted device.
   * @param target the device or interaction URN.
   * @returns the device ID.
   */
  async getDeviceId(target: SingleTarget): Promise<string> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.ID) as string
  }

  /**
   * Returns the location of a targeted device.
   * @param target the device or interaction URN.
   * @param refresh whether you would like to refresh before retrieving the location.  Defaults to false.
   * @returns the location of the device.
   */
  async getDeviceLocation(target: SingleTarget, refresh: boolean): Promise<string> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.ADDRESS, refresh) as string
  }

  /**
   * Returns whether the location services on a device are enabled.
   * @param target the device or interaction URN.
   * @returns 'true' if the device's location services are enabled, 'false' otherwise.
   */
  async getDeviceLocationEnabled(target: SingleTarget): Promise<boolean> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.LOCATION_ENABLED) as boolean
  }

  /**
   * Returns the address of a targeted device
   * @param target the device or interaction URN.
   * @param refresh whether you would like to refresh before retrieving the address.  Defaults to false.
   * @returns the address of the device.
   */
  async getDeviceAddress(target: SingleTarget, refresh: boolean): Promise<string> {
    return await this.getDeviceLocation(target, refresh)
  }

  /**
   * Retrieves the coordinates of the device's location.
   * @param target the device or interaction URN.
   * @param refresh whether you would like to refresh before retrieving the coordinates.
   * @returns the coordinates of the device's location.
   */
  async getDeviceCoordinates(target: SingleTarget, refresh: boolean): Promise<number[]> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.COORDINATES, refresh) as number[]
  }

  /**
   * Returns the latitude and longitude coordinates of a targeted device.
   * @param target the device or interaction URN.
   * @param refresh whether you would like to refresh before retrieving the coordinates. Defaults to false.
   * @returns an array containing the latitude and longitude of the device's location.
   */
  async getDeviceLatLong(target: SingleTarget, refresh=false): Promise<number[]> {
    return await this.getDeviceCoordinates(target, refresh) as number[]
  }

  /**
   * Returns the indoor location of a targeted device.
   * @param target the device or interaction URN.
   * @param refresh whether you would like to refresh before retrieving the location.  Defaults to false.
   * @returns the indoor location of the device.
   */
  async getDeviceIndoorLocation(target: SingleTarget, refresh: boolean): Promise<string> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.INDOOR_LOCATION, refresh) as string
  }

  /**
   * Returns the battery of a targeted device.
   * @param target the device or interaction URN.
   * @param refresh whether you would like to refresh before retrieving the battery.  Defaults to false.
   * @returns the battery level on the device.
   */
  async getDeviceBattery(target: SingleTarget, refresh: boolean): Promise<number> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.BATTERY, refresh) as number
  }

  /**
   * Returns the device type of a targeted device, i.e. gen 2, gen 3, etc.
   * @param target the device or interaction URN.
   * @returns the device type.
   */
  async getDeviceType(target: SingleTarget): Promise<enums.DeviceType> {
    return await this._getDeviceInfo(target, DeviceInfoQuery.TYPE) as enums.DeviceType
  }

  /**
   * Used privately by device information functions to set information fields on the device,
   * such as location, name, and channel of the device.
   * @param target the device or interaction URN.  This can only have one item.
   * @param field the type of information you would like to set, such as the 'name', 'channel', etc.
   * @param value the new value of the field.
   */
  private async setDeviceInfo(target: SingleTarget, field: enums.DeviceInfoField, value: string): Promise<void> {
    await this._castTarget(target, `set_device_info`, { field, value })
  }

  /**
   * Sets the name of a targeted device and updates it on the Relay Dash.
   * The name remains updated until it is set again via a workflow or updated manually
   * on the Relay Dash.
   * @param target the device or interaction URN.
   * @param name a new name for your device.
   */
  async setDeviceName(target: SingleTarget, name: string): Promise<void> {
    await this.setDeviceInfo(target, DeviceInfoField.LABEL, name)
  }

  // SETDEVICECHANNEL CURRENTLY DOES NOT WORK

  // /**
  //  * Sets the channel of a targeted device and updates it on the Relay Dash.
  //  * The new channel remains until it is set again via a workflow or updated on the
  //  * Relay Dash.
  //  * @param target the device or interaction URN.
  //  * @param channel the channel that you would like to update your device to.
  //  */
  // async setDeviceChannel(target: SingleTarget, channel: string): Promise<void> {
  //   await this.setDeviceInfo(target, DeviceInfoField.CHANNEL, channel)
  // }

  // TODO: wf_api_set_device_info_request's location_enabled string booleans?
  /**
   * Enables location services on a device.  Location services will remain
   * enabled until they are disabled on the Relay Dash or through a workflow.
   * @param target the device or interaction URN.
   */
  async enableLocation(target: SingleTarget): Promise<void> {
    await this.setDeviceInfo(target, DeviceInfoField.LOCATION_ENABLED, `true`)
  }

  /**
   * Disables location services on a device.  Location services will remain
   * disabled until they are enabled on the Relay Dash or through a workflow.
   * @param target the device or interaction URN.
   */
  async disableLocation(target: SingleTarget): Promise<void> {
    await this.setDeviceInfo(target, DeviceInfoField.LOCATION_ENABLED, `false`)
  }

  // SETDEVICEMODE CURRENTLY DOES NOT WORK

  // /**
  //  * Sets the mode of the device.
  //  * @param target the device or interaction URN.
  //  * @param mode the updated mode of the device, which can be 'panic', 'alarm', or 'none'. Defaults to 'none'.
  //  */
  // async setDeviceMode(target: SingleTarget, mode: `panic` | `alarm` | `none`): Promise<void> {
  //   await this._castTarget(target, `set_device_mode`, { mode })
  // }

  /**
   * Sets the channel that a device is on.  This can be used to change the channel of a device during a workflow,
   * where the channel will also be updated on the Relay Dash.
   * @param target the device or interaction URN.
   * @param name the name of the channel you would like to set your device to.
   * @param suppressTTS whether you would like to surpress the text to speech.  Defaults to false.
   * @param disableHomeChannel whether you would like to disable the home channel.  Defaults to false.
   */
  async setChannel(target: SingleTarget, name:string, { suppressTTS=false, disableHomeChannel=false }: { suppressTTS?: boolean, disableHomeChannel?: false }={}): Promise<void> {
    await this._castTarget(target, `set_channel`, { channel_name: name, suppress_tts: suppressTTS, disable_home_channel: disableHomeChannel })
  }

  /**
   * Listens for the user to speak into the device.  Utilizes speech to text functionality to interact
   * with the user.
   * @param target the interaction URN.
   * @param phrases optional phrases that you would like to limit the user's response to.  Defualts to none.
   * @returns text representation of what the user had spoken into the device.
   */
  async listen(target: SingleTarget, phrases=[], { transcribe=true, alt_lang=Language.ENGLISH, timeout=60 }={}): Promise<ListenResponse> {
    const request_id = makeId()
    await this._castTargetWithId(request_id, target, `listen`, {
      transcribe,
      phrases,
      timeout,
      alt_lang,
    }, timeout * 1000)

    const response = await this._waitForEventMatch(Event.SPEECH, { request_id }) as SpeechEvent

    if (transcribe) {
      return { text: response.text, lang: response.lang }
    } else {
      return { audio: response.audio }
    }
  }

  /**
   * Used for creatinga a call ID request.
   * @param arg can be a unique string or a BaseCallEvent.
   * @returns the call ID.
   */
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

  /**
   * Retrieves the number of messages in a device's inbox.
   * @param target the device or interaction URN whose inbox you would like to check.
   * @returns the number of messages in the specified device's inbox.
   */
  async getUnreadInboxSize(target: SingleTarget): Promise<number> {
    const { count } = await this._callTarget(target, `inbox_count`) as Record<`count`, string>
    return filterInt(count)
  }

  /**
   * Play a targeted device's inbox messages.
   * @param target the device or interaction URN whose inbox messages you would like to play.
   */
  async playUnreadInboxMessages(target: SingleTarget): Promise<void> {
    await this._castTarget(target, `play_inbox_messages`)
  }

  // END SINGLE-TARGET ACTIONS

  // END TARGETED ACTIONS

  // START NON-TARGETED ACTIONS
  // FOLLOWING ACTIONS __DO NOT__ REQUIRE TARGET
  // THEY RUN IN THE CONTEXT OF THE WORKFLOW
  // AND NOT AN INTERACTION / CHANNEL

  /**
   * Creates an empty group
   * @param name the name of the group to be created
   * @returns the new group's URN
   */
  async createGroup(name: string): Promise<GroupTarget> {
    const { uri } = await this._call(`create_group`, { name }) as Record<`uri`, GroupTarget>
    return uri
  }

  /**
   * Serves as a named timer that can be either interval or timeout.  Allows you to specify
   * the unit of time.
   * @param type can be 'timeout' or 'interval'.  Defaults to 'timeout'.
   * @param name a name for your timer
   * @param timeout an integer representing when you would like your timer to fire.
   * @param timeout_type can be 'ms', 'secs', 'mins' or 'hrs'. Defaults to 'secs'.
   */
  async setTimer(type: enums.TimerType, name: string, timeout=60, timeout_type: enums.TimeoutType): Promise<void> {
    await this._cast(`set_timer`, { type, name, timeout, timeout_type })
  }

  /**
   * Clears the specified timer.
   * @param name the name of the timer that you would like to clear.
   */
  async clearTimer(name: string): Promise<void> {
    await this._cast(`clear_timer`, { name })
  }

  /**
   * Translates the text from one language to another.
   * @param text the text that you would like to translate.
   * @param from the languagef that you would like to translate from.
   * @param to the language that you would like to translate to.
   * @returns the translated text.
   */
  async translate(text: string, from=Language.ENGLISH, to=Language.SPANISH): Promise<string> {
    const { text: translatedText } = (await this._call(`translate`, { text, from_lang: from, to_lang: to})) as Record<`text`, string>
    return translatedText
  }

  /**
   * Returns the members of a particular group.
   * @param groupUri the URN of the group that you would like to retrieve the members from.
   * @returns a list of members within the specified group.
   */
  async getGroupMembers(groupUri: GroupTarget): Promise<SingleTarget[]> {
    const { member_uris } = await this._call(`group_query`, { group_uri: groupUri, query: `list_members` }) as Record<`member_uris`, string[]>
    return member_uris
  }

  /**
   * Checks whether a device is a member of a particular group.
   * @param groupNameUri the URN of a group.
   * @param potentialMemberNameUri the URN of the device name.
   * @returns 'true' if the device is a member of a specified group, 'false' otherwise.
   */
  async isGroupMember(groupNameUri: GroupTarget, potentialMemberNameUri: SingleTarget): Promise<boolean> {
    const groupName = Uri.parseGroupName(groupNameUri)
    const deviceName = Uri.parseDeviceName(potentialMemberNameUri)
    const groupUri = Uri.groupMember(groupName, deviceName)

    const { is_member } = await this._call(`group_query`, { group_uri: groupUri, query: `is_member` }) as Record<`is_member`, boolean>
    return is_member
  }

  /**
   * Removes all members from a group and deletes the group
   * @param groupUri the Group URN to delete
   */
  async deleteGroup(groupUri: GroupTarget): Promise<void> {
    await this._cast(`delete_group`, { uri: groupUri })
  }

  /**
   * Adds members to the group
   * @param groupUri the Group URN to add members to
   * @param target a SingleTarget URN or array of SingleTarget URN to add to the group
   */
  async addGroupMembers(groupUri: GroupTarget, target: Target): Promise<void> {
    await this._callTarget(target, `add_group_members`, { group_uri: groupUri })
  }

  /**
   * Removes members from the group
   * @param groupUri the Group URN to remove members from
   * @param target a SingleTarget URN or array of SingleTarget URN to add to the group
   */
  async removeGroupMembers(groupUri: GroupTarget, target: Target): Promise<void> {
    await this._castTarget(target, `remove_group_members`, { group_uri: groupUri })
  }

  /**
   * Sets default analytical event parameters.
   * @param params any default parameters for an analytical event that you would like to set.
   */
  async setDefaultAnalyticEventParameters(params: Record<string, string|number|boolean>): Promise<void> {
    this.defaultAnalyticEventParameters = params
  }

  /**
   * Log an analytics event from a workflow with the specified content and
   * under a specified category. This does not log the device who
   * triggered the workflow that called this function.
   * @param message a description for your analytical event.
   * @param category a category for your analytical event.
   */
  async logMessage(message: string, category=`default`): Promise<void> {
    await this._cast(`log_analytics_event`, {
      category,
      content_type: `text/plain`,
      content: message,
    })
  }

  /**
   * Log an analytic event from a workflow with the specified content and
   * under a specified category.  This includes the device who triggered the workflow
   * that called this function.
   * @param message a description for your analytical event.
   * @param target the URN of a device that triggered this function.
   * @param category a category for your analytical event.
   */
  async logUserMessage(message: string, target: SingleTarget, category=`default`): Promise<void> {
    await this._cast(`log_analytics_event`, {
      device_uri: target,
      category,
      content_type: `text/plain`,
      content: message,
    })
  }

  /**
   * Tracks an analytical event that doesn't specify the user.
   * @param category the category of the analytical event.
   * @param parameters any TrackEventParameters you would like to include.
   */
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

  /**
   * Tracks an analytical event that specifies the user.
   * @param category the category of the analytical event.
   * @param target the user associated with the event.
   * @param parameters any TrackEventParameters you would like to include.
   */
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

  private _logSdkInfo() {
    setTimeout(() => {
      this._cast(`log_analytics_event`, {
        category: `sdk-info`,
        content_type: `application/vnd.relay.sdk.info+json`,
        analytics_content: {
          language: `relay-js`,
          version: process.env.npm_package_version,
        }
      })
    }, 0)
  }

  /**
   * Sets a variable with the corresponding name and value. Scope of
   * the variable is from start to end of a workflow.
   * @param name name of the variable to be created.
   * @param value value that the variable will hold.
   */
  async setVar(name: string, value: string): Promise<void> {
    await this._cast(`set_var`, { name, value: toString(value) })
  }

  /**
   * Used to set an object with with a specified value.
   * @param obj a Record object that you would like to set.
   * @param value the value that you want your object to have.
   */
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

  /**
   * Unsets the value of a variable.
   * @param name the name of the variable whose value you would like to unset.
   */
  async unsetVar(name: string): Promise<void> {
    await this._cast(`unset_var`, { name })
  }

  /**
   * Unsets the value of one or many variables.
   * @param names the name or names of the variable you would like to unset.
   */
  async unset(names: string|string[]): Promise<void> {
    if (Array.isArray(names)) {
      Promise.all(names.map(name => this.unsetVar(name)))
    } else {
      return this.unsetVar(names)
    }
  }

  /**
   * Retrieves a variable that was set either during workflow registration
   * or through the set_var() function.  The variable can be retrieved anywhere
   * within the workflow, but is erased after the workflow terminates.
   * @param name the name of the variable to be retrieved.
   * @param defaultValue default value of the variable if it does not exist.  Defaults to undefined.
   * @returns the variable requested.
   */
  async getVar(name: string, defaultValue=undefined): Promise<string|undefined> {
    const result = await this._call(`get_var`, { name }) as Record<`value`, string>
    if (result === undefined) {
      return defaultValue
    } else {
      return result.value
    }
  }

  /**
   * Retrieves a mapped variable.
   * @param name the name of the variable to retrieve.
   * @param mapper the mapper.
   * @param defaultValue the default value for the variable if it does not exist.
   * @returns the value of the mapper variable.
   */
  async getMappedVar<Type>(name: string, mapper: Mapper<Type>, defaultValue=undefined): Promise<Type|undefined> {
    const value = await this.getVar(name, defaultValue)
    if (value === undefined) {
      return value
    }
    return mapper(value)
  }

  /**
   * Retrieves a variable that has a numerical value.
   * @param name the name of the variable to retrieve.
   * @param defaultValue the default value for the variable if it does not exist.
   * @returns the numerical variable.
   */
  async getNumberVar(name: string, defaultValue=undefined): Promise<number|undefined> {
    return await this.getMappedVar(name, Number, defaultValue)
  }

  /**
   * Retrieves a variable that is an array.
   * @param name the name of the variable to retrieve.
   * @param defaultValue the default value for the variable if it does not exist.
   * @returns the array variable.
   */
  async getArrayVar(name: string, defaultValue=undefined): Promise<string[]|undefined> {
    return await this.getMappedVar(name, arrayMapper, defaultValue)
  }

  /**
   * Retrieves a variable that is an array of numbers.
   * @param name the name of the variable to retrieve.
   * @param defaultValue the default value for the variable if it does not exist.
   * @returns the array variable.
   */
  async getNumberArrayVar(name: string, defaultValue=undefined): Promise<number[]|undefined> {
    return await this.getMappedVar(name, numberArrayMapper, defaultValue)
  }

  /**
   * Helper method for retrieving variables.
   * @param names the name or names of the desired variables.
   * @param mappers mapper for the variable.
   * @returns the variable/variables.
   */
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

  /**
   * Starts an unnamed timer, meaning this will be the only timer on your device.
   * The timer will fire when it reaches the limit of the 'timeout' parameter.
   * @param timeout the number of seconds you would like to wait until the timer fires.
   */
  async startTimer(timeout=60): Promise<void> {
    await this._cast(`start_timer`, { timeout })
  }

  /**
   * Stops an unnamed timer.
   */
  async stopTimer(): Promise<void> {
    await this._cast(`stop_timer`)
  }

  /**
   * Creates an incident that will alert the Relay Dash.
   * @param originatorUri the device URN that triggered the incident.
   * @param type the type of incident that occurred.
   * @returns the incident ID.
   */
  async createIncident(originatorUri: SingleTarget, type: string): Promise<string> {
    const { incident_id } = await this._call(`create_incident`, { type, originator_uri: originatorUri })  as Record<`incident_id`, string>
    return incident_id
  }

  /**
   * Resolves an incident that was created.
   * @param incidentId the ID of the incident that you would like to resolve.
   * @param reason the reason for resolving the incident.
   */
  async resolveIncident(incidentId: string, reason: string): Promise<void> {
    await this._cast(`resolve_incident`, { incident_id: incidentId, reason })
  }

  /**
   * Terminates a workflow.  This method is usually called
   * after your workflow has completed and you would like to end the
   * workflow by calling end_interaction(), where you can then terminate
   * the workflow.
   */
  async terminate(): Promise<void> {
    await this._send(makeId(), `wf_api_terminate_request`, {}, undefined)
    await this._waitForEventMatch(Event.STOP)
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

    const port = options.port ?? (process.env.PORT ? parseInt(process.env.PORT) : 8080)
    const serverOptions = options.server ? { server: options.server } : { port }
    server = new Server(serverOptions, () => {
      if (serverOptions.server) {
        console.log(`Relay SDK WebSocket attached to supplied Server`)
        debug(`Attached to supplied server`)
      } else {
        console.log(`Relay SDK WebSocket Server listening => ${port}`)
        debug(`Listening on port ${port}`)
      }
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
            debug(`Workflow closed =>`, websocket.connectionId)
            instances?.delete(websocket.connectionId)
          })

          const _workflow = new Workflow(websocket)
          workflow(_workflow)
          instances?.set(websocket.connectionId, _workflow)
          debug(`Workflow connection =>`, websocket.connectionId)
        } else {
          debug(`Workflow not found; terminating websocket =>`, websocket.connectionId)
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
            debug(`Default workflow set`)
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
