// This is a module that is launched from index.js. See the instructions there.

import pkg from '@relaypro/sdk'
const { Event, createWorkflow } = pkg

export default createWorkflow(relay => {
  relay.on(Event.START, async (event) => {
    const { trigger: { args: { source_uri } } } = event

    let date_obj = new Date()

    // Create a variable that has the value of the date and time that the workflow
    // was triggered.
    await relay.setVar(`my_start_time`, date_obj)

    relay.startInteraction(source_uri, `date time`)
  })

  relay.on(Event.INTERACTION_STARTED, async ({ source_uri: interaction_uri }) => {
    // We can use the value of this variable we created in another event.
    // getVar returns the value that is stored in that variable.
    await relay.say(interaction_uri, `This workflow was triggered at` + await relay.getVar(`my_start_time`))

    await relay.endInteraction(interaction_uri)
  })

  relay.on(Event.INTERACTION_ENDED, async() => {
    // However, once the workflow instance terminates, the stored value is gone
    await relay.terminate()
  })
})
