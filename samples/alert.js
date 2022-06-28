import pkg, { relay } from '@relaypro/sdk'
const { Event, createWorkflow, Uri } = pkg

export default createWorkflow(relay => {
        
    
    relay.on(Event.START, async(event) => {
      const { trigger: {args: {source_uri } } } = event
      //relay.startInteraction(source_uri, 'alert')
        const actualTargets = 'Main'.split(',').map(Uri.groupName)
        await relay.alert(actualTargets, source_uri, 'alert_test', 'This is a test alert', {})
    })

    relay.on(Event.NOTIFICATION, async(notificationEvent) => {
        
        relay.broadcast(notificationEvent.source_uri, notificationEvent.source_uri, 'user_acknowledged', `You acknowledged the event`, {})
        const actualTargets = 'Main'.split(',').map(Uri.groupName)
        await relay.cancelAlert(actualTargets, 'cleanup_alert')
        await relay.terminate()
    })
      
})