/**
 * events-api.js is the beginning of a reusable api (possibly published NPM module)
 *
 * At present, we start a WebSocket Server and listens for messages.
 */

import WebSocket from 'ws'
import { randomBytes } from 'crypto'
import events from 'events'

const PORT = process.env.PORT ?? 8080
const HEARTBEAT = process.env.HEARTBEAT ?? 30000
const STRICT_PATH = process.env.STRICT_PATH ?? `1`

const noop = () => {}
const makeId = () => randomBytes(16).toString(`hex`)

const TIMEOUT = 5000
const REFRESH_TIMEOUT = 45000

const safeParse = msg => {
  try {
    return JSON.parse(msg)
  } catch(err) {
    console.log(`failed to parse message =>`, msg)
  }
}

class RelayEventAdapter extends events.EventEmitter {

  constructor(websocket) {
    super()
    console.log(`creating event adapter`)
    this.websocket = websocket
    this.websocket.on(`close`, this.onClose.bind(this))
    this.websocket.on(`message`, this.onMessage.bind(this))
  }

  async onClose() {
    this.websocket = null
  }

  onMessage(msg) {
    const message = safeParse(msg)
    if (message && !message._id) { // not interested in response events (marked by correlation id)

      switch (message._type) {
        case `wf_api_start_event`:
          this.emit(`start`)
          break
        case `wf_api_button_event`:
          this.emit(`button`, message.button, message.taps)
          break
        case `wf_api_timer_event`:
          this.emit(`timer`)
          break
        case `wf_api_notification_event`:
          this.emit(`notification`, message.source, message.name, message.event, message.notification_state)
          break
        default:
          console.log(`Unknown message =>`, message)
          break
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

  async sendReceive(type, payload, timeout=TIMEOUT) {
    const id = makeId()

    await this.send(type, payload, id)

    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.websocket?.off?.(`message`, responseListener)
        reject(`failed-to-receive-response-timeout`)
      }, timeout)

      const responseListener = msg => {
        clearTimeout(timeoutHandle)
        const event = safeParse(msg)
        const { _id, _type, ...params } = event
        if (_id === id) { // interested here in response events (marked by correlation id)
          if (_type === `wf_api_${type}_response`) {
            resolve(Object.keys(params).length > 0 ? params : true)
          } else if (_type === `wf_api_error_response`) {
            reject(event.error)
          } else {
            console.log(`Unknown response`, event)
          }
          this.websocket.off(`message`, responseListener) // stop listening
        }
      }

      this.websocket.on(`message`, responseListener)
    })
  }

  async say(text) {
    return await this.sendReceive(`say`, { text })
  }

  async play(filename) {
    return this.sendReceive(`play`, { filename })
  }

  async vibrate(pattern) {
    return this.sendReceive(`vibrate`, { pattern })
  }

  async switchLedOn(led, color) {
    return this.sendReceive(`set_led`, { effect: `static`, args: { colors: { [`${led}`]: color } } })
  }

  async switchAllLedOn(color) {
    return this.sendReceive(`set_led`, { effect: `static`, args: { colors: { ring: color } } })
  }

  async switchAllLedOff() {
    return this.sendReceive(`set_led`, { effect: `off`, args: {} })
  }

  async rainbow(rotations=-1) {
    return this.sendReceive(`set_led`, { effect: `rainbow`, args: { rotations } })
  }

  async rotate() {
    return this.sendReceive(`set_led`, { effect: `rotate`, args: { rotations: -1, colors: { [`1`]: `FFFFFF` } } })
  }

  async flash() {
    return this.sendReceive(`set_led`, { effect: `flash`, args: { count: -1, colors: { ring: `0000FF` } } })
  }

  async breathe() {
    return this.sendReceive(`set_led`, { effect: `breathe`, args: { count: -1, colors: { ring: `0000FF` } } })
  }

  async getDeviceName() {
    return this.getDeviceInfo(`name`)
  }

  async getDeviceLocation(refresh) {
    return this.getDeviceInfo(`location`, refresh)
  }

  async getDeviceIndoorLocation(refresh) {
    return this.getDeviceInfo(`indoor_location`, refresh)
  }

  async getDeviceBattery(refresh) {
    return this.getDeviceInfo(`battery`, refresh)
  }

  async getDeviceInfo(query, refresh=false) {
    const response = await this.sendReceive(`get_device_info`, { query, refresh }, refresh ? REFRESH_TIMEOUT : TIMEOUT)
    return response[query]
  }

  async setDeviceName(name) {
    return this.setDeviceInfo(`label`, name)
  }

  async setDeviceChannel(channel) {
    return this.setDeviceInfo(`channel`, channel)
  }

  async setDeviceInfo(field, value) {
    return this.sendReceive(`set_device_info`, { field, value })
  }

  async setChannel(name, target) {
    return this.sendReceive(`set_channel`, { channel_name: name, target })
  }

  async set(obj, value) {
    if (typeof obj === `object`) {
      return Promise.all(
        Object.entries(obj)
          .map(([name, value]) => this.setVar(name, value))
      )
    } else {
      return this.setVar(obj, value)
    }
  }

  async setVar(name, value) {
    return this.sendReceive(`set_var`, { name, value })
  }

  async get(names) {
    if (Array.isArray(names)) {
      return Promise.all(
        names.map(name => this.getVar(name))
      )
    } else {
      return this.getVar(names)
    }
  }

  async getVar(name, defaultValue=undefined) {
    const { value } = await this.sendReceive(`get_var`, { name }) ?? defaultValue
    return value
  }

  async startTimer(timeout=60) {
    return this.sendReceive(`start_timer`, { timeout })
  }

  async stopTimer() {
    return this.sendReceive(`stop_timer`)
  }

  async broadcast(text, target) {
    return this.sendNotification(`broadcast`, text, target)
  }

  async notify(text, target) {
    return this.sendNotification(`notify`, text, target)
  }

  async alert(name, text, target) {
    return this.sendNotification(`alert`, text, target, name)
  }

  async cancelAlert(name, target) {
    return this.sendNotification(`cancel`, undefined, target, name)
  }

  async sendNotification(type, text, target, name) {
    return this.sendReceive(`notification`, { type, name, text, target })
  }

  async listen(phrases=[], { transcribe=true, timeout=60 }={}) {
    const { text } = await this.sendReceive(`listen`, { transcribe, phrases, timeout }, timeout * 1000)
    return text
  }

  async createIncident(type) {
    const { incident_id } = await this.sendReceive(`create_incident`, { type })
    return incident_id
  }

  async resolveIncident(incidentId, reason) {
    return this.sendReceive(`resolve_incident`, { incident_id, reason })
  }

  async terminate() {
    return this.send(`terminate`)
  }
}

const DEFAULT_WORKFLOW = `__default_relay_workflow__`
let workflows = null
let instances = null
let server = null

const initializeRelaySdk = (options={}) => {
  if (workflows) {
    throw new Error(`Relay SDK already initialized`)
  } else {
    workflows = new Map()
    instances = new Map()

    server = new WebSocket.Server({ port: PORT }, () => {
      console.log(`Relay SDK WebSocket Server listening => ${PORT}`)
    })

    server.shouldHandle = request => {
      console.info(`WebSocket request =>`, request.url)
      const shouldEnforceStrictPaths = (options.STRICT_PATH ?? STRICT_PATH) === `1`
      const path = request.url.slice(1)
      const hasDefaultWorkflow = workflows.has(DEFAULT_WORKFLOW)
      const hasNamedWorkflow = workflows.has(path)
      // console.log(`shouldHandle`, {
      //   shouldEnforceStrictPaths,
      //   hasDefaultWorkflow,
      //   hasNamedWorkflow
      // })
      return shouldEnforceStrictPaths ? hasNamedWorkflow : hasDefaultWorkflow
    }

    server.on(`connection`, (websocket, request) => {
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
          // console.log({ code, reason })
          instances.delete(websocket.connectionId)
        })

        const adapter = new RelayEventAdapter(websocket)
        workflow(adapter)
        instances.set(websocket.connectionId, adapter)
        console.info(`Workflow connection =>`, websocket.connectionId)
      } else {
        console.info(`Workflow not found; terminating websocket =>`, websocket.connectionId)
        websocket.terminate()
      }
    })

    server.on(`error`, err => {
      console.error(err)
    })

    setInterval(() => {
      server.clients.forEach(websocket => {
        if (websocket.isAlive === false) {
          return websocket.terminate()
        }
        websocket.isAlive = false
        websocket.ping(noop)
      })
    }, HEARTBEAT)

    return {
      workflow: (path, workflow) => {
        const isFunction = (typeof path === `function`)
        const isString = (typeof path === `string`)
        if (isFunction) {
          console.info(`Default workflow set`)
          workflows.set(DEFAULT_WORKFLOW, path)
        } else if (isString) {
          const strippedPath = path.replace(/^\/+/,``)
          workflows.set(strippedPath, workflow)
        } else {
          throw new Error(`First argument for workflow must either be a string or a function`)
        }
      }
    }
  }
}

export default initializeRelaySdk
