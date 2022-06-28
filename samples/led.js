import pkg, { relay } from '@relaypro/sdk'
const { Event, createWorkflow } = pkg

export default createWorkflow( relay => {
    relay.on(Event.START, async(event) => {
        const { trigger: { args: { source_uri } } } = event
        relay.startInteraction(source_uri, 'led')
    })

    relay.on(Event.INTERACTION_STARTED, async({source_uri: interaction_uri}) => {
        // The LEDs make a rainbow that rotates 3 times
        await relay.rainbow(interaction_uri, 3)
        
        // All of the LEDs are turned on and set to be blue
        await relay.switchAllLedOn(interaction_uri, "0000FF")
        
        //All of the LEDs are turned off
        await relay.switchAllLedOff(interaction_uri)

        await relay.endInteraction(source_uri, 'led')
    })

    relay.on(Event.INTERACTION_ENDED, async() => {
        await relay.terminate()
    })

})