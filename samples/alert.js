import pkg, { relay } from '@relaypro/sdk'
const { Event, createWorkflow, Uri } = pkg

export default createWorkflow(relay => {
          
    relay.on(Event.START, async(event) => {
        const { trigger: {args: {source_uri } } } = event
        const targets = Uri.groupName('Cleaning')
        await relay.alert(targets, source_uri, 'cleanup_alert', 'Cleanup needed in room 213', {})
    })

    relay.on(Event.NOTIFICATION, async(notificationEvent) => {  
        relay.broadcast(notificationEvent.source_uri, notificationEvent.source_uri, 'user_acknowledged', `You acknowledged the alert`, {})
        const targets = Uri.groupName('Cleaning')
        await relay.cancelAlert(targets, 'cleanup_alert')
        
        await relay.terminate()
    })   
})