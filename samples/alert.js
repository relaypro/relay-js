// This is a module that is launched from index.js. See the instructions there.

import pkg from '@relaypro/sdk'
const { Event, createWorkflow, Uri } = pkg

export default createWorkflow(relay => {

  relay.on(Event.START, async(event) => {
    const { trigger: {args: {source_uri } } } = event
    const targets = Uri.groupName(`Cleaning`)

    // Send out an alert to the Cleaning group
    await relay.alert(targets, source_uri, `cleanup_alert`, `Cleanup needed in room 213`, {})
  })

  relay.on(Event.NOTIFICATION, async(notificationEvent) => {
    // Let the group know that someone acknowledged the alert
    relay.broadcast(notificationEvent.source_uri, notificationEvent.source_uri, `user_acknowledged`, `The alert has been acknowledged`, {})
    const targets = Uri.groupName(`Cleaning`)

    // Cancel the alert
    await relay.cancelAlert(`cleanup_alert`, targets)
    await relay.terminate()
  })
})
