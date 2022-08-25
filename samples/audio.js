// This is a module that is launched from index.js. See the instructions there.

import pkg from '@relaypro/sdk'
const { Event, createWorkflow } = pkg


export default createWorkflow(relay => {
  relay.on(Event.START, async(event) => {
    const { trigger: {args: {source_uri } } } = event
    relay.startInteraction(source_uri, `audio`)
  })

  relay.on(Event.INTERACTION_STARTED, async({source_uri: interaction_uri}) => {
    // Play the custom audio that you have uploaded via the Relay CLI
    // (see the Guides at developer.relaypro.com for details on how to do that).
    await relay.playAndWait(interaction_uri, `relay-static://emergency`)

    await relay.endInteraction(interaction_uri, `audio`)
  })

  relay.on(Event.INTERACTION_ENDED, async() => {
    await relay.terminate()
  })
})
