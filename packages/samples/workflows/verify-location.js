const createApp = (relay) => {
  relay.on(`start`, async () => {
    const name = await relay.getDeviceName()
    const location = await relay.getVar(`match_spillover`)
    await relay.say(`Verifying if ${name} is in location ${location}`)

    try {
      const indoorLocation = await relay.getDeviceIndoorLocation(true)
      await relay.say(`The device's indoor location is ${indoorLocation}`)
    } catch (err) {
      console.error(`error getting indoor location`, err)
      await relay.say(`There was an error getting the device's indoor location.`)
    }

    await relay.terminate()
  })
}

export default createApp
