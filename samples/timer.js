import pkg, { createWorkflow } from '@relaypro/sdk'
const { Event, Uri} = pkg

export default createWorkflow( relay => {
  relay.on(Event.START, async(event) =>{
    const { trigger: { args: { source_uri } } } = event
    relay.startInteraction(source_uri, 'timer')
  })

  relay.on(Event.INTERACTION_STARTED, async ({source_uri}) => {
    await relay.say(source_uri, 'Starting timer')
    await relay.setVar('tick_num', 1)
    await relay.setVar('interaction', source_uri)
    await relay.startTimer(await relay.getVar('interval', 60))
  })

  relay.on(Event.TIMER, async() => {
    let num = await relay.getVar('tick_num')
    await relay.setVar('count', 5)

    if ( num >= await relay.getVar('count', 5) ) {
      const target = Uri.groupName('Stations')
      await relay.broadcast(target, await relay.getVar('interaction'), 'Next Station', 'Hi team, it is time to rotate', {})
      await relay.terminate()
    } else {
      await relay.setVar(`tick_num`, ++num)
    }
  })

})