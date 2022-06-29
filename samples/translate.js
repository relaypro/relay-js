import pkg from '@relaypro/sdk'
const { Event, createWorkflow } = pkg

export default createWorkflow(relay => {
    relay.on(Event.START, async(event) => {
        const { trigger: { args: { source_uri } } } = event
        
        await relay.startInteraction(source_uri, 'translate')
    })

    relay.on(Event.INTERACTION_STARTED, async({source_uri: interaction_uri}) => {
        await relay.say(interaction_uri, 'Hold the talk button and say what you would like to translate.')
        const { text: phrase } = await relay.listen(interaction_uri)

        // Translates message from English to French
        await relay.say(interaction_uri, await relay.translate(phrase, 'en-US', 'fr-FR'))

        await relay.endInteraction(interaction_uri, 'translate')
    })

    relay.on(Event.INTERACTION_ENDED, async() => {
        await relay.terminate()
    })
})