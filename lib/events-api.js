/**
 * events-api.js is the beginning of a reusable api (possibly published NPM module)
 *
 * At present, we start a WebSocket Server and listens for messages.
 */

import { randomBytes } from 'crypto'
import events from 'events'

import { createWebSocketServer } from './server.js'

const noop = () => {}
const makeId = () => randomBytes(16).toString(`hex`)

const safeParse = msg => {
  try {
    return JSON.parse(msg)
  } catch(err) {
    console.log(`failed to parse message =>`, msg)
  }
}

class RelayEventAdapter extends events.EventEmitter {

  constructor(ws) {
    super()
    console.log(`creating event adapter`)
    this.websocket = ws
    this.websocket.on(`close`, this.onClose)
    this.websocket.on(`message`, this.onMessage)
  }

  onClose = async () => {
    this.websocket = null
  }

  onMessage = (msg) => {
    const message = safeParse(msg)
    if (message && !message._id) { // not interested in response events (marked by correlation id)

      switch (message._type) {
        case `wf_api_start_event`:
          this.emit(`start`)
          break;
        case `wf_api_button_event`:
          this.emit(`button`, message.button, message.taps)
          break;
        case `wf_api_timer_event`:
          this.emit(`timer`)
          break;
        case `wf_api_notification_event`:
          this.emit(`notification`, message.source, message.event)
          break;
        default:
          console.log(`Unknown message =>`, message)
          break;
      }
    }
  }

  async stop() {
    console.log(`stopping event adapter`)
    if (this.websocket) {
      console.log(`terminating event adapter websocket`)
      this.websocket.terminate()
    }
  }

  async send(type, payload={}, id) {
    return new Promise((resolve, reject) => {
      if (!this.websocket) {
        reject(`websocket-not-connected`)
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
          reject(`failed-to-send`)
        } else {
          resolve(`sent`)
        }
      })
    })
  }

  async sendReceive(type, payload) {
    const id = makeId()

    await this.send(type, payload, id)

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.websocket?.off?.(`message`, responseListener)
        reject(`failed-to-receive-response-timeout`)
      }, 10_000)

      const responseListener = msg => {
        const event = safeParse(msg)
        const { _id, _type, ...params } = event
        if (_id === id) { // interested here in response events (marked by correlation id)
          if (_type === `wf_api_${type}_response`) {
            resolve(params)
          } else if (_type === `wf_api_error_response`) {
            reject(event.error)
          } else {
            console.log(`Unknown response`, event)
          }
          this.websocket.off(`message`, responseListener) // stop listening
          clearTimeout(timeout)
        }
      }

      this.websocket.on(`message`, responseListener)
    })
  }

  async say(text) {
    return this.send(`say`, { text })
  }

  async play(filename) {
    return this.send(`play`, { filename })
  }

  async vibrate(pattern) {
    return this.send(`vibrate`, { pattern })
  }

  async setLED(effect, args={}) {
    return this.send(`set_led`, { effect, args })
  }

  async getDeviceName() {
    return this.getDeviceInfo(`name`)
  }

  async getDeviceLocation() {
    return this.getDeviceInfo(`location`, refresh)
  }

  async getDeviceIndoorLocation(refresh) {
    return this.getDeviceInfo(`indoor_location`, refresh)
  }

  async getDeviceBattery(refresh) {
    return this.getDeviceInfo(`battery`, refresh)
  }

  async getDeviceInfo(query, refresh=false) {
    const response = await this.sendReceive(`get_device_info`, { query, refresh })
    return response[query]
  }

  async setDeviceName(name) {
    return this.setDeviceInfo(`name`, name)
  }

  async setDeviceChannel(channel) {
    return this.setDeviceInfo(`channel`, channel)
  }

  async setDeviceInfo(field, value) {
    await this.sendReceive(`set_device_info`, { field, value })
  }

  async setVar(name, value) {
    return this.send(`set_var`, { name, value })
  }

  async getVar(name, defaultValue=undefined) {
    const { value } = await this.sendReceive(`get_var`, { name }) ?? defaultValue
    return value
  }

  async startTimer(timeout=60) {
    return this.send(`start_timer`, { timeout })
  }

  async stopTimer() {
    return this.send(`stop_timer`)
  }

  async broadcast(text, target) {
    return this.sendNotification(`broadcast`, text, target)
  }

  async notify(text, target) {
    return this.sendNotification(`background`, text, target)
  }

  async alert(text, target) {
    return this.sendNotification(`foreground`, text, target)
  }

  async sendNotification(type, text, target) {
    return this.send(`notification`, { type, text, target })
  }

  async listen(phrases=[], { transcribe=true, timeout=60 }={}) {
    const { text } = await this.sendReceive(`listen`, { transcribe, phrases, timeout })
    return text
  }

  async terminate(state) {
    return this.send(`terminate`)
  }
}

export const createRelayEventAdapter = async (ws) => {
  const websocket = ws ?? await createWebSocketServer()
  return new RelayEventAdapter(websocket)
}
