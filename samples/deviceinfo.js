import pkg, { relay } from '@relaypro/sdk'
const { Event, createWorkflow, Uri } = pkg

export default createWorkflow(relay => {
  relay.on(Event.START, async (event) => {
    const { trigger: { args: { source_uri } } } = event
    relay.startInteraction([source_uri], `device information`)
  })

  relay.on(Event.INTERACTION_STARTED, async ({ source_uri: interaction_uri }) => {
    // Get the name of the device that triggered the interaction
    const deviceName = await relay.getDeviceName(interaction_uri)
    await relay.sayAndWait(interaction_uri, `The name of the device is ${deviceName}`)

    // Get the battery of the device
    const battery = await relay.getDeviceBattery(interaction_uri, true)
    await relay.sayAndWait(interaction_uri, `The device has a battery level of ${battery}`)

    // Give the device a new name, which will also be updated on the Relay Dash
    await relay.setDeviceName(interaction_uri,'New Name')
    const newName = await relay.getDeviceName(interaction_uri)
    await relay.sayAndWait(interaction_uri, `The device's new name is ${newName}`)
    
    await relay.endInteraction(interaction_uri, 'device information')
  })

  relay.on(Event.INTERACTION_ENDED, async() => {
    await relay.terminate()
  })
})