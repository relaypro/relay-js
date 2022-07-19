import { relay } from '@relaypro/sdk'
import helloworld from './helloworld.js'
import deviceinfo from './deviceinfo.js'
import incident from './incident.js'
import location from './location.js'
import broadcast from './broadcast.js'
import vibrate from './vibrate.js'
import alert from './alert.js'
import led from './led.js'
import translate from './translate.js'
import variables from './variables.js'
import analytics from './analytics.js'
import audio from './audio.js'
import notify from './notify.js'
import timer from './timer.js'

const app = relay({
    subscriberId: `6aa4cf8f-cb49-483b-aca8-80b01a4c1e25`,
    apiKey: `447e27bc111b4787eb7f48a239eda352`,
})

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

