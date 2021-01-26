
const createApp = (relay) => {
  relay.on(`start`, async () => {
    const [type, targets, confirm] = await relay.get([`incident_type`, `targets`, `audible_confirmation_for_originator`])
    const actualTargets = targets.split(`,`)
    console.log(`panic workflow targets: ${targets}`)
    // create incident (acts as a container for related events in history)
    await relay.createIncident(type)
    // try and get a fresh location first
    let location
    try {
      location = await relay.getDeviceIndoorLocation(true)
      if (location === `location_not_found`) {
        location = `Unknown Location`
      }
    } catch {
      location = `Unknown Location`
    }

    console.log(`Retrieved location ${location}`)

    const name = await relay.getDeviceName()
    console.log(`Retrieved device name ${name}`)
    await relay.alert(`initial_alert`, `${name} has created a panic alert from ${location}`, actualTargets)
    if (confirm) {
      await relay.say(`Panic alert sent`)
    }
  })

  relay.on(`notification`, async (source, id, event, state) => {
    if (event === `ack_event`) {
      if (id === `initial_alert`) {
        await handleInitalAlert(source, id, state)
      } else if (id === `acknowledge_response`) {
        handleAcknowledgeResponse()
      }
    }
  })

  const handleInitalAlert = async (source, id, state) => {
    console.log(`notification state:`, state)
    const { acknowledged, created } = state
    const otherResponders = created.filter(responder => responder !== acknowledged)
    // cancel the alert notification sent to devices other than the acknowledger
    await relay.cancelNotification(id, otherResponders)
    // let the other "responders" know that one of them has acknowledged the alert
    await relay.set({ acknowledged_by: source })
    await relay.broadcast(`${source} has responded to the panic alert`, otherResponders)
    // set all "responders" to the specified group
    const [group, confirm] = await relay.get([`emergency_group`, `audible_confirmation_for_originator`])
    if (group) {
      console.log(`Setting emergency group channel to ${group} for ${created}`)
      await relay.setChannel(group, created)
    } else {
      console.log(`No emergency group set, not changing channel of responders`)
    }
    // if workflow wants silence on the end of the originator, do not create a notification;
    // simply mark the incident as resolved and end the workflow
    if (confirm) {
      console.log(`creating alert notification for originator ${source}`)
      await relay.alert(`acknowledge_response`, `${source} is responding to your panic alert`)
    } else {
      console.log(`resolving incident; ending workflow`)
      await relay.resolveIncident()
      await relay.terminate()
    }
  }

  const handleAcknowledgeResponse = async () => {
    const [name] = await relay.get([`acknowledged_by`])
    console.log(`panic has been acknowledged by ${name}; ending workflow`)
    await relay.resolveIncident()
    await relay.terminate()
  }
}

export default createApp
