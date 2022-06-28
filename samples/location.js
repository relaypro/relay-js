import pkg, { relay } from '@relaypro/sdk'
const { Event, createWorkflow, Uri } = pkg

export default createWorkflow(relay => {
  relay.on(Event.START, async(event) => {
    const { trigger: { args: { source_uri } } } = event
    await relay.startInteraction(source_uri, 'location')
  })

  relay.on(Event.INTERACTION_STARTED, async({ source_uri: interaction_uri }) => {

    await relay.disableLocation(interaction_uri)
    const disabled = await relay.getDeviceLocationEnabled(interaction_uri)
    await relay.say(interaction_uri, `Location enabled is ${disabled}`)

    await relay.enableLocation(interaction_uri)
    const enabled = await relay.getDeviceLocationEnabled(interaction_uri)
    await relay.say(interaction_uri, `Location enabled is ${enabled}`)

    const coords = await relay.getDeviceCoordinates(interaction_uri, false)
    await relay.say(interaction_uri, `Device coordinates are ${coords[0]} latitude and ${coords[1]} longitude`)

    const outdoorLocation = await relay.getDeviceLocation(interaction_uri, true)
    await relay.say(interaction_uri, `The device's outdoor location is ${outdoorLocation}`)

    const indoorLocation = await relay.getDeviceIndoorLocation(interaction_uri, false)
    await relay.say(interaction_uri, `The device's indoor location is ${indoorLocation}`)
    await relay.terminate()
  })

})