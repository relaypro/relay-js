// This is a standlone reference implementation of a simple workflow.
// You can use this as a template for your own workflow implementations.
// For it to listen for incoming triggers and events, run as:
//   node helloworld_standalone.js
// and use the Relay CLI to register it with the Relay server as described
// in the Guides at https://developer.relaypro.com.

import { relay, Event, createWorkflow, Uri } from '@relaypro/sdk'

const app = relay({port: 8080})

const helloWorkflow = createWorkflow(workflow => {
  const interactionName = 'hello interaction'

  workflow.on(Event.START, async (event) => {
    const { trigger: { args: { source_uri } } } = event
    await workflow.startInteraction([source_uri], interactionName)
  })

  workflow.on(Event.INTERACTION_STARTED, async ({ source_uri }) => {
    await workflow.sayAndWait(source_uri, 'hello world')
    await workflow.endInteraction([source_uri], interactionName)
  })

  workflow.on(Event.INTERACTION_ENDED, async() => {
    await workflow.terminate()
  })
})

app.workflow(`hellopath`, helloWorkflow)
