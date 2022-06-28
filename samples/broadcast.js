import pkg, { relay } from '@relaypro/sdk'
const { Event, createWorkflow, Uri } = pkg

export default createWorkflow(relay => {
  
  relay.on(Event.START, async(event) => {
    const { trigger: { args: { source_uri } } } = event
    const target = Uri.groupName('Main')
    await relay.broadcast(target, source_uri, 'broadcast_test', 'Hi team, this is a test broadcast', {})
    
    await relay.terminate()
  })
})



  
    



