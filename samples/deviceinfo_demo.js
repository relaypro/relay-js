
const createApp = (relay) => {
  return {
    async onStart(state) {
      const name = await relay.getDeviceName(state)
      await relay.say(state, `The name of this device is ${name}`)
      const location = await relay.getDeviceLocation(state)
      await relay.say(state, `The device is located at the following street address ${location}`)
      await relay.terminate()
    }
  }
}

export default createApp
