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
      await relay.terminate()
    }
  })

  relay.on(`button`, async () => {
    console.log(`action button pressed while outstanding acks exist`)
    await relay.say(`Not all broadcasts have been acknowledged yet.`)
  })

  relay.on(`notification`, async (source, id, event, state) => {
    console.log(`notification state is ${state}`)
    const { acknowledged, created } = state
    if (acknowledged) {
      console.log(`all braodcast notifications have been acked, shutting down`)
      relay.terminate()
    } else {
      console.log(`${source} has acked the broadcast, ${created?.length - acknowledged?.length} left to ack of ${created?.length}`)
    }
  })
}

export default createApp
