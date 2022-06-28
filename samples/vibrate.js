import pkg from '@relaypro/sdk'
const { Event, createWorkflow } = pkg

export default createWorkflow(relay => {
  relay.on(Event.START, async (event) => {
    const { trigger: { args: { source_uri: originator } } } = event
    await relay.startInteraction([originator], `vibrate demo`)
  })

  relay.on(Event.INTERACTION_STARTED, async ({ source_uri: interaction }) => {
    await relay.sayAndWait(interaction, `This is a default vibrate pattern`)
    await relay.vibrate(interaction, [500, 800, 800, 800, 800, 800])
    await relay.terminate()
  })
})