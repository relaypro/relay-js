@relaypro/sdk / [Exports](modules.md)

# relay-js

relay-js SDK is a node.js library for interacting with Relay. For full documentation visit [api-docs.relaypro.com](https://api-docs.relaypro.com)

## Installation

```bash
npm install @relaypro/sdk
```

## Usage

The following code snippet demonstrates a very simple "Hello World" workflow. However, it does show some of the power that is available through the Relay SDK.

```javascript
import { relay, Event } from '@relaypro/sdk'

const app = relay()

app.workflow(`helloworld`, workflow => {
  workflow.on(Event.START, async () => {
    const greeting = await relay.get(`greeting`)
    const name = await relay.getDeviceName()
    await relay.say(`What is your name ?`)
    const user = await relay.listen()
    await relay.say(`Hello ${user}! ${greeting} ${name}`)
    await relay.terminate()
  })
})
```

Features demonstrated here:

* When the workflow is triggered, the `start` event is emitted and the registered start callback
  function is called.
* A configuration variable `greeting` is retrieved as is the triggering device's name.
* The workflow then uses text-to-speech to prompt the user for their name.
* The workflow awaits for a response from the device user.
* The workflow then again uses text-to-speech to reply with a dynamic message.
* Finally, the workflow is terminated and the device is returned to its original state.

In this sample, a workflow callback function is registered with the name `helloworld`. This value
of `helloworld` is used to map a WebSocket connection at the path `ws://yourhost:port/helloworld`
to the registered workflow callback function.

It is also possible to register a "default" workflow at path `/` by providing the workflow callback
function as the first parameter:

```javascript
app.workflow(wf => {
  wf.on(Event.START, async () => {
    // handle start event
  })
})
```

## API

The Relay JS SDK covers a broad set of use cases. Explore the various actions that can be performed
in workflow event callbacks:

* [Relay](classes/relayeventadapter.md)

## Workflow Registration

  More thorough documentation on how toregister your workflow on a Relay device
  can be found at https://api-docs.relaypro.com/docs/register-workflows

In order to configure

## Development

```bash
git clone git@github.com:relaypro/relay-js.git
cd relay-js
npm install
npm run build
npm run test
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
