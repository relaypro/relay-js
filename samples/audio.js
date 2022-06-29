import pkg, { relay } from '@relaypro/sdk'
const { Event, createWorkflow, Uri } = pkg


export default createWorkflow(relay => {
  relay.on(Event.START, async(event) => {
    const { trigger: {args: {source_uri } } } = event
    relay.startInteraction(source_uri, 'audio')
  })

  relay.on(Event.INTERACTION_STARTED, async({source_uri: interaction_uri}) => {
    // Play the custom audio that you have uploaded
    await relay.playAndWait(interaction, 'relay-static://emergency')
    
    await relay.endInteraction(interaction_uri, 'audio')
  })
    
  relay.on(Event.INTERACTION_ENDED, async() => {
    await relay.terminate()
  })
})