import { Event, createWorkflow } from '@relaypro/sdk'

export default createWorkflow(relay => {
  relay.on(Event.START, async () => {
    const greeting = await relay.getVar(`greeting`)
    const name = await relay.getDeviceName()
    await relay.say(`What is your name ?`)
    const user = await relay.listen()
    await relay.say(`Hello ${user}! ${greeting} ${name}`)
    await relay.terminate()
  })
})
