
const createApp = (relay) => {

  relay.on(`start`, async () => {
    await relay.say(`This is a vibrate pattern`)
    await relay.vibrate([100, 500, 500,  500, 500, 500])
    await relay.terminate()
  })

}

export default createApp
