# Migration

## From 2.4 to 2.5

- Remove the interactionName parameter from the endInteraction method, as it became unneeded.

## From Workflows 1.x to 2.x

### Interactions

The primary change from Workflows 1.x to 2.x is that in 1.x the workflow executed in the context
of the triggering device. In Workflows 2.x, channel creation is now up to the workflow developer.
This is accomplished by "starting an interaction". The interaction is a temporary channel that is
created on the device for the duration of the interaction.

As a result, Workflows 2.0 are more flexible even if they are more verbose. The decisions made are
a result of striving to make the API surface more predictable and consistent by removing things
that "just happen" and make the APIs for explicit in nature.

How workflows are triggered are now more consistent:

1. Workflows can be triggered by some type of user action on a device.
1. Workflows can be triggered by some external event, such as a timer or HTTP request.

Further, by maintaining indepedent interactions, this separates channel creation to a more predictable
point in code, thus enabling more execution contexts based on the workflow's needs.

1. Execute logic without creating a channel on a device.
1. Start an interaction on the triggering device (the only option in Workflows 1.x).
1. Start interactions on other devices, excluding the triggering device.
1. Start interactions on the triggering device and other devices.

All interactions end automatically when the workflow terminates. Although an interaction _can_ be
terminated prior to workflow terminatio, but it is not required.

### Interaction Options

Because Workflow 1.x had only one channel on the triggering device and Workflow 2.x delays channel
creation to when interaction(s) are started, channel options are now moved from the workflow
definition to when the interaction/channel is started.

## "Magic" Arguments Removed

"Well-known" workflow arguments previously available through the `getVar` action, such as `"spillover"` are
no longer supplied through `getVar`. Instead, most Workflow Events have an event argument that event
data is supplied. If the event data that is supplied to a given event is needed in another event, it
must be manually saved to future retrieval through `setVar` and then later `getVar`.

For instance, consider the following:

```javascript
// Workflow 1.x
createWorkflow(relay => {
  relay.on(Event.START, async () => {
    const spillover = await relay.getVar(`spillover`)
    // do something with spillover
    await relay.sayAndWait(`You said ${spillover}`)
    await relay.terminate()
  }
})

// Workflow 2.x
createWorkflow(relay => {
  relay.on(Event.START, async () => {
    const { trigger: { args: { phrase, spillover, source_uri: originator } } } = event
    // save off spillover and phrase
    await relay.set({ phrase, spillover })
    await relay.startInteraction(originator, `phrase confirmation`)
  }
  relay.on(Event.INTERACTION_STARTED, async ({ source_uri: interaction }) => {
    const [phrase, spillover] = await relay.get([`phrase`, `spillover`])
    await relay.sayAndWait(`You triggered with phrase ${phrase} and then said ${spillover}`)
    await relay.terminate()
  })
})
```

### URNs

URNs (a type of canonical URI) are now used to address resources. The general structure is as follows
(with some examples) and are used throughout a workflow to identify devices, groups, and interactions:

```
urn:relay-resource:<id_type>:<resource_type>:<id>
id_type => 'id' | 'name'
resource_type => 'interaction' | 'device' | 'group'

// group named `abc`
urn:relay-resource:name:group:abc

// device named `xyz`
urn:relay-resource:name:device:xyz

// interaction named `hello world` belonging to device named `Cam`
// remember that multiple interaction/channel instances can belong to the same
// workflow instance and as a result, narrowing down to a specific interaction
// is necessary to properly deliver an action
urn:relay-resource:name:interaction:hello%20world?device=urn%3Arelay-resource%3Aname%3Adevice%3ACam
```

### Using URNs with events and actions

Most Workflow Events provide a `source_uri` in event parameter if the event is triggered, or sourced, from
a device. Some Workflow Events are sourced independent of a device (for instance, Timer event) and, as a result,
do not have a `source_uri`.

Most Workflow Action requests resource a target URN and can be divided into three cateogries:

1. Actions that operate on a single target interaction.
1. Actions that can operate on one or more target interactions.
1. Actions that can operate on a device or group.

The first two types are actions that can only be delivered to a started interaction. The last type can be
run against a device that does not have a started interaction.

### Error Handling

Some aspects of error handling are still being implemented. Now that actions can target multiple device
interactions / channels, it wasn't immediately clear when code written against the SDK would want to handle
errors and at what granularity. We have a hypothesis outlined and are currently evaluating. Unfortunately,
there are many situations where if a bad URN is sent either as a single target or part of many targets,
the action fails silently.

We are working towards two guiding philosophies so please report if the following are not true:

1. All action requests return a correlated response or error.
1. All actions resulting in an error can be inspected so that SDK code can make a decision of what to do next.

### Interaction Lifecycle

In Workflows 1.x, the channel was already created when the workflow start event was received. In Workflows 2.x,
with channel creation delayed to when the workflow logic starts the interaction, a series of interaction
lifecycle events are emitted:

1. `INTERACTION_STARTED` is sent when the interaction is started and the device's channel created. It is safe
   to start sending actions that require an interaction.
2. `INTERACTION_RESUMED` is sent when the interaction becomes the active channel on the deivce, including when
   the interaction is first started. Further, if configured, interaction channels can be navigated away from.
   Thus, when navigating back to the channel, the `INTERACTION_RESUMED` event is sent.
3. `INTERACTION_SUSPENDED` is sent when the user navigates away from the interaction channel.
4. `INTERACTION_ENDED` is sent when the interaction is ended.

When starting an interaction, the client will always get a started and resumed lifecycle event. Note that an
ended lifecycle event is not guaranteed if the workflow is being ended at the same time as a result of a
`terminate` action. Note that the `source_uri` in this case will be an interaction URI. Interaction URIs can
be used for any action requests that require an interaction URI or a device URI (when the interaction URI
addresses a single interaction). This means that, in most cases, the `source_uri` from this interaction event
can be used as an URI in almost any action request that targets a device.

```javascript
createWorkflow(relay => {
  relay.on(Event.START, async () => {
    const { trigger: { args: { source_uri: originator } } } = event
    await relay.startInteraction(originator, `test`)
  }
  // started event is always sent first
  relay.on(Event.INTERACTION_STARTED, async ({ source_uri: interaction }) => { })
  // resumed is sent whenever
  relay.on(Event.INTERACTION_RESUMED, async ({ source_uri: interaction }) => { })
  relay.on(Event.INTERACTION_SUSPENDED, async ({ source_uri: interaction }) => { })
  relay.on(Event.INTERACTION_ENDED, async ({ source_uri: interaction }) => { })
})
```
