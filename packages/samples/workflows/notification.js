
const createApp = (relay) => {
  relay.on(`start`, async () => {
    const text = await relay.getVar(`text`)
    const target = await relay.getVar(`targets`)
    const type = await relay.getVar(`type`)

    await relay[type](text, target)
  })

  relay.on(`notification`, async (source/*, name, event, state*/) => {
    await relay.say(`ack ack baby ! ${source} acknowledged the alert`)
    await relay.terminate()
  })
}

export default createApp
