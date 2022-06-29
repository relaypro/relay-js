import pkg from '@relaypro/sdk'
const { Event, createWorkflow } = pkg

export default createWorkflow(relay => {
  relay.on(Event.START, async (event) => {
    const { trigger: { args: { source_uri: originator } } } = event
    
    await relay.startInteraction([originator], `vibrate`)
  })

  relay.on(Event.INTERACTION_STARTED, async ({ source_uri: interaction_uri }) => {
    await relay.sayAndWait(interaction_uri, `This is a default vibrate pattern`)

    // The device will vibrate 3 times
    await relay.vibrate(interaction_uri, [500, 800, 800, 800, 800, 800])

    await relay.endInteraction(interaction_uri, 'vibrate')
  })

  relay.on(Event.INTERACTION_ENDED, async() => {
    await relay.terminate()
  })
})