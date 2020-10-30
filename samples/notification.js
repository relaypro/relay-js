
const createApp = (relay) => {
  return {
    async onStart(state) {
      const text = await relay.getVar(state, `text`)
      const target = await relay.getVar(state, `targets`)
      const type = await relay.getVar(state, `type`)

      await relay[type](state, text, target)
    },

    async onNotification(state, source, actionType) {
      await relay.say(state, `ack ack baby ! ${source} acknowledged the alert`)
      await relay.terminate(state)
    }
  }
}

export default createApp
