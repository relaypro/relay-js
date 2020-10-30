/**
 * events-api.js is the beginning of a reusable api (possibly published NPM module)
 *
 * At present, we start a WebSocket Server and listens for messages.
 */

import WebSocket from 'ws'
import { randomBytes } from 'crypto'
import { listenerCount } from 'process'

const noop = () => {}
const makeId = () => randomBytes(16).toString(`hex`)

const safeParse = msg => {
  try {
    return JSON.parse(msg)
  } catch(err) {
    console.log(`failed to parse message =>`, msg)
  }
}

export const createRelayEventAdapter = () => {

  let ws

  const api = {
    async start({ onStart=noop, onButton=noop, onTimer=noop, onNotification=noop }) {
      try {
        ws = await createWebSocket()

        ws.on(`close`, async () => {
          ws = null
          ws = await createWebSocket() // backoff?
        })

        ws.on(`message`, msg => {
          const event = safeParse(msg)
          if (event && !event.id) { // not interested in response events (marked by correlation id)
            switch (event.type) {
              case `on_start`:
                onStart(event.state)
                break;
              case `on_button_event`:
                onButton(event.state, event.action)
                break;
              case `on_timer_event`:
                onTimer(event.state)
                break;
              case `on_notification_event`:
                onNotification(event.state, event.source, event.subtype)
                break;
              default:
                console.log(`Unknown event =>` event)
                break;
            }
          }
        })

        return true

      } catch (err) {
        console.error(`Failed to start Relay Event Adapter`, err)
        return false
      }
    }

    async send(type, state, payload={}) {
      return new Promise((resolve, reject) => {
        if (!ws) {
          reject(`relay-event-websocket-not-connected`)
        }

        const data = JSON.stringify({ type: `wf_api_${type}_request`, state, payload })

        ws.send(data, (err) => {
          if (err) {
            reject(`failed-to-send`)
          } else {
            resolve(`sent`)
          }
        })
      })
    }

    async sendReceive(type, state, payload) {
      const id = makeId()
      await this.send(type, state, payload)

      return new Promise((resolve, reject) => {
        const responseListener = msg => {
          const event = safeParse(msg)
          if (event.id === id) { // interested here in response events (marked by correlation id)
            if (event.type === `wf_api_${type}_response`) {
              resolve(event.payload)
            } else if (event.error) {
              reject(event.error)
            } else {
              console.log(`Unknown response`, event)
            }
          }
          ws.off(`message`, responseListener) // stop listening
        }

        ws.on(`message`, responseListener)

        setTimeout(() => {
          ws.off(`message`, responseListener)
          reject(`failed-to-receive-response`)
        }, 10_000)
      })
    }

    async say(state, text) {
      return this.send(`say`, state, { text })
    }

    async play(state, filename) {
      return this.send(`play`, state, { filename })
    }

    async vibrate(state, pattern) {
      return this.send(`vibrate`, state, { pattern })
    }

    async setLED(state, pattern) {
      return this.send(`set_led`, state, { pattern })
    }

    async getDeviceName(state) {
      return this.getDeviceInfo(state, `name`)
    }

    async getDeviceLocation(state) {
      return this.getDeviceInfo(state, `location`)
    }

    async getDeviceIndoorLocation(state) {
      return this.getDeviceInfo(state, `indoor_location`)
    }

    async getDeviceBatter(state) {
      return this.getDeviceInfo(state, `battery`)
    }

    async getDeviceInfo(state, type) {
      return this.sendReceive(`get_device_info`, state, { type })
    }

    async setVar(state, name, value) {
      return this.sendReceive(`set_var`, state, { name, value })
    }

    async getVar(state, name, defaultValue=undefined) {
      return this.sendReceive(`get_var`, state, { name }) ?? defaultValue
    }

    async startTimer(state, timeout=60) {
      return this.send(`start_timer`, state, { timeout })
    }

    async stopTimer(state) {
      return this.send(`stop_timer`, state)
    }

    async broadcast(state, text, target) {
      return this.sendNotification(state, `broadcast`, text, target)
    }

    async notify(state, text, target) {
      return this.sendNotification(state, `background`, text, target)
    }

    async alert(state, text, target) {
      return this.sendNotification(state, `foreground`, text, target)
    }

    async sendNotification(state, type, text, target) {
      return this.send(`notification`, state, { type, text, target })
    }

    async listen(state, phrases=[]) {
      return this.sendReceive(`listen`, state, { transcribe: true, phrases, timeout: 60 })
    }

    async terminate(state) {
      return this.send(state, `terminate`)
    }
  }

  return api
}

const createWebSocket = async () => {
  return createWebSocketServer()
  // TODO need to convince Sai that ibot should be the server
  // return createWebSocketClient()
}

const createWebSocketClient = async () => {
  throw new Error(`not-implemented`)
}

const createWebSocketServer = async ({
  port=8080,
  heartbeatInterval=30_000,
}={}) => {

  return new Promise((resolve, reject) => {
    const wss = new WebSocket.Server({ port })

    wss.on(`connection`, ws => {
      ws.isAlive = true

      ws.on(`pong`, () => {
        ws.isAlive = true
      })

      resolve(ws)
    })

    const interval = setInterval(() => {
      wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
          return ws.terminate()
        }

        ws.isAlive = false
        ws.ping(noop)
      })
    }, heartbeatInterval)

    wss.on(`close`, () => {
      clearInterval(interval)
    })

    wss.on(`error`, err => {
      reject(err)
    })
  })
}
