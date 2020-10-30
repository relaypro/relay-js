
const createApp = (relay) => {
  return {
    async onStart(state) {
      const greeting = await relay.getVar(state, `greeting`)
      const name = await relay.getDeviceName(state)
      await relay.say(state, `What is your name ?`)
      const user = await relay.listen(state)
      await relay.say(state, `Hello ${user}! ${greeting} ${name}`)
      await relay.terminate(state)
    }
  }
}

export default createApp
