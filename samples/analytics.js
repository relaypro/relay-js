// This is a module that is launched from index.js. See the instructions there.

import pkg from '@relaypro/sdk'
const { Event, createWorkflow } = pkg

export default createWorkflow(relay => {
  relay.on(Event.START, async(event) => {
    const { trigger: { args: { source_uri } } } = event

    relay.startInteraction(source_uri, `logging analytics`)
  })

  relay.on(Event.INTERACTION_STARTED, async({ source_uri: interaction_uri }) => {
    await relay.say(interaction_uri, `Logging an analytics event`)

    // Log an analytics event
    await relay.logUserMessage(`This workflow was triggered`, `990007560103795`, `Analytics Event`)

    await relay.endInteraction(interaction_uri)
  })

  relay.on(Event.INTERACTION_ENDED, async() => {
    await relay.terminate()
  })
})
