import WebSocket from 'ws'

const PORT = process.env.PORT || 8080
const HEARTBEAT = process.env.HEARTBEAT || 30_000

export const createWebSocketServer = () => {

  return new Promise((resolve, reject) => {
    const server = new WebSocket.Server({ port: PORT })

    server.on(`connection`, websocket => {
      websocket.isAlive = true

      websocket.on(`pong`, () => {
        websocket.isAlive = true
      })

      resolve(websocket)
    })

    const interval = setInterval(() => {
      server.clients.forEach(websocket => {
        if (websocket.isAlive === false) {
          return websocket.terminate()
        }

        websocket.isAlive = false
        websocket.ping(noop)
      })
    }, HEARTBEAT)

    server.on(`close`, () => {
      clearInterval(interval)
    })

    server.on(`error`, err => {
      reject(err)
    })
  })
}
