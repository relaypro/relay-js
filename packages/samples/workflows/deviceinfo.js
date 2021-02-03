const createApp = (relay) => {
  relay.on(`start`, async () => {
    const name = await relay.getDeviceName()
    await relay.say(`The name of this device is ${name}`)
    const location = await relay.getDeviceLocation()
    await relay.say(`The device is located at the following street address ${location}`)
    await relay.terminate()
  })
}

export default createApp
