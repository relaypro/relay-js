
const createApp = (relay) => {
  relay.on(`start`, async () => {
    await relay.setVar(`tick_num`, 1)
    await relay.startTimer(await relay.getVar(`interval`, 60))
    relay.say(`starting timer`)
  })

  relay.on(`button`, async (button, taps) => {
    if (button === `action` && taps === `single`) {
      await relay.say(`stopping timer`)
      await relay.terminate()
    } else {
      relay.say(`dude ! stop pressing buttons`)
    }
  })

  relay.on(`timer`, async () => {
    let num = relay.getVar(`tick_num`)
    const count = relay.getVar(`count`, 5)

    if (num < count) {
      await relay.say(`stopping timer`)
      await relay.terminate()
    } else {
      await relay.say(`${num}`)
      await relay.setVar(`tick_num`, ++num)
    }
  })
}

export default createApp
