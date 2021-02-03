import { relay } from '@relaypro/sdk'

import helloworld from './workflows/helloworld.js'
import deviceinfo from './workflows/deviceinfo.js'
import interval from './workflows/interval.js'
import notification from './workflows/notification.js'
import vibrate from './workflows/vibrate.js'

const app = relay()

// "named" workflows must match the WS path
// e.g. ws://host:port/helloworld
// app.workflow(`helloworld`, helloworld)
app.workflow(`deviceinfo`, deviceinfo)
app.workflow(`interval`, interval)
app.workflow(`notification`, notification)
app.workflow(`vibrate`, vibrate)

// only one "un-named" workflow allowed...
// e.g. ws://host:port/
// e.g. ws://host:port
// enabled by setting ENV parameter:
// STRICT_PATH=1 node index.js
app.workflow(relay => {
  relay.on(`start`, async () => {
    relay.say(`This is a default workflow`)
    relay.terminate()
  })
})
