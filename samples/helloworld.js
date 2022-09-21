// This is a module that is launched from index.js. See the instructions there.

import pkg from '@relaypro/sdk'
const { Event, createWorkflow, Uri } = pkg

export default createWorkflow(relay => {

  relay.on(Event.START, async (event) => {
    const { trigger: { args: { source_uri } } } = event

    await relay.startInteraction([source_uri], `hello world`)
  })

  relay.on(Event.INTERACTION_STARTED, async ({ source_uri }) => {
    const deviceName = Uri.parseDeviceName(source_uri)

    // Ask the user for their name and listen to their response
    await relay.sayAndWait(source_uri, `What is your name ?`)
    const { text: userProvidedName } = await relay.listen(source_uri)

    // Get the 'greeting' variable that was set when the workflow was registered, and then greet the user
    const greeting = await relay.getVar(`greeting`)
    await relay.sayAndWait(source_uri, `${greeting} ${userProvidedName}! You are currently using ${deviceName}`)

    await relay.endInteraction([source_uri])
  })

  relay.on(Event.INTERACTION_ENDED, async() => {
    await relay.terminate()
  })
})
