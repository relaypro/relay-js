import { createRelayEventAdapter } from './lib/events-api.js'

import createApp from './samples/helloworld.js'
// import createApp from './samples/deviceinfo_demo'
// import createApp from './samples/interval_timer'
// import createApp from './samples/notification'
// import createApp from './samples/vibrate'

const relayEventAdapter = await createRelayEventAdapter()
const app = createApp(relayEventAdapter)
