
const createApp = (relay) => {
  return {
    async onStart(state) {
      await relay.say(state, `This is a vibrate pattern`)
      await relay.vibrate(state, [100, 500, 500,  500, 500, 500])
      await relay.terminate(state)
    }
  }
}

export default createApp
