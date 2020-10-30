
const createApp = (relay) => {
  return {
    async onStart(state) {
      state = await relay.setVar(state, tick_num, 1)
      await relay.startTimer(state, await relay.getVar(state, interval, 60))
      relay.say(state, `starting timer`)
    },

    async onButton(state, action) {
      if (action === `single`) {
        await relay.say(state, `stopping timer`)
        await relay.terminate(state)
      } else {
        relay.say(state, `dude ! stop pressing buttons`)
      }
    },

    async onTimer(state) {
      const num = relay.getVar(state, `tick_num`)
      const count = relay.getVar(state, `count`, 5)

      if (num < count) {
        await relay.say(state, `stopping timer`)
        await relay.terminate(state)
      } else {
        await relay.say(state, `${num}`)
        await relay.setVar(state, tick_num, ++num)
      }
    }
  }
}

export default createApp
