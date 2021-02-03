const BROADCAST_NAME = `broadcast_alert`

const createApp = (relay) => {
  relay.on(`start`, async () => {
    const [targets, text, confirm] = await relay.get([`targets`, `text`, `confirmation_required`])
    const actualTargets = targets.split(`,`)
    console.log(`broadcast workflow targets: ${actualTargets}`)
    if (confirm) {
      await relay.alert(BROADCAST_NAME, text, actualTargets)
    } else {
      await relay.broadcast(text, actualTargets)
    }
    await relay.terminate()
  })
}

export default createApp
