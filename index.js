import { createRelayEventAdapter } from './events-api'

import createApp from './samples/helloworld'
// import createApp from './samples/deviceinfo_demo'
// import createApp from './samples/interval_timer'
// import createApp from './samples/notification'
// import createApp from './samples/vibrate'

// not in love with passing adapter and app to each other
const relayEventAdapter = createRelayEventAdapter()
const app = createApp(relayEventAdapter)
relayEventAdapter.start(app)
