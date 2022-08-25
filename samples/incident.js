// This is a module that is launched from index.js. See the instructions there.

import pkg from '@relaypro/sdk'
const { Event, createWorkflow } = pkg

export default createWorkflow(relay => {
  relay.on(Event.START, async(event) => {
    const { trigger: { args: { source_uri } } } = event
    // Save the URN of the device that started the incident
    await relay.setVar(`incident_urn`, source_uri)

    // Create an incident using the createIncident method with the incident URN.
    // This notifies the admin that an incident has occurred.
    await relay.createIncident(source_uri, `incident`)
  })

  relay.on(Event.INCIDENT, async() => {
    // When the incident has been resolved by administration, an interaction is started to
    // let the user can know the incident has been resolved.
    await relay.startInteraction(await relay.getVar(`incident_urn`), `incident resolved`)
  })

  relay.on(Event.INTERACTION_STARTED, async({ source_uri: interaction_uri }) => {
    // Let the user know that the incident has been resolved and terminate the workflow
    await relay.say(interaction_uri, `The incident has been resolved by admin.`)

    await relay.endInteraction(interaction_uri, `incident`)
  })

  relay.on(Event.INTERACTION_ENDED, async() => {
    await relay.terminate()
  })

})
