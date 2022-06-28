import pkg, { relay } from '@relaypro/sdk'
const { Event, createWorkflow, Uri } = pkg

export default createWorkflow(relay => {
        
    
    relay.on(Event.START, async(event) => {
      const { trigger: {args: {source_uri } } } = event
      const targets = Uri.groupName('Engineering')
      await relay.notify(targets, source_uri, 'notify_test', 'Hi team, please meet in room 316.', {})
    })

    relay.on(Event.NOTIFICATION, async() => {
      const targets = Uri.groupName('Engineering')
      await relay.cancelNotify(targets, 'notify_test')
        await relay.terminate()
    })
      
})