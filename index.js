import { relay } from '@relaypro/sdk'
import helloworld from './samples/helloworld.js'
import deviceinfo from './samples/deviceinfo.js'
import incident from './samples/incident.js'
import location from './samples/location.js'
import broadcast from './samples/broadcast.js'
import vibrate from './samples/vibrate.js'
import alert from './samples/alert.js'
import led from './samples/led.js'
import translate from './samples/translate.js'
import variables from './samples/variables.js'
import analytics from './samples/analytics.js'
import audio from './samples/audio.js'
import notify from './samples/notify.js'
import timer from './timer/timer.js'

const app = relay({
    subscriberId: `6aa4cf8f-cb49-483b-aca8-80b01a4c1e25`,
    apiKey: `447e27bc111b4787eb7f48a239eda352`,
})

// const device = await app.api.fetchDevice(`990007560004928`)

// console.log(`device`, device)

// "named" workflows must match the WS path
// e.g. ws://host:port/helloworld
app.workflow(`helloworld`, helloworld)
app.workflow(`deviceinfo`, deviceinfo)
app.workflow(`location`, location)
app.workflow(`broadcast`, broadcast)
app.workflow(`vibrate`, vibrate)
app.workflow('led', led)
app.workflow('alert', alert)
app.workflow('translate', translate)
app.workflow('variables', variables)
app.workflow('analytics', analytics)
app.workflow('incident', incident)
app.workflow('audio', audio)
app.workflow('notify', notify)
app.workflow('timer', timer)


