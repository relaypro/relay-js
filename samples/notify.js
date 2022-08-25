// This is a module that is launched from index.js. See the instructions there.

import pkg from '@relaypro/sdk'
const { Event, createWorkflow, Uri } = pkg

export default createWorkflow(relay => {


  relay.on(Event.START, async(event) => {
    const { trigger: {args: {source_uri } } } = event
    const targets = Uri.groupName(`Engineering`)

    // Send out a notification to the Engineering group
    await relay.notify(targets, source_uri, `notification`, `Hi team, please meet in room 316.`, {})
  })

  relay.on(Event.NOTIFICATION, async() => {
    const targets = Uri.groupName(`Engineering`)
    await relay.cancelNotify(targets, `notification`)

    await relay.terminate()
  })

})
