# relay-js

relay-js SDK is a Node.js library for interacting with Relay. For full documentation visit [developer.relaypro.com](https://developer.relaypro.com).

## Installation

```bash
npm install @relaypro/sdk
```

## Usage

The following code snippet demonstrates a very simple "Hello World" workflow. However, it does show some of the power that is available through the Relay SDK.

```javascript
import pkg from '@relaypro/sdk'
const { relay, Event, createWorkflow, Uri } = pkg

const app = relay()

app.workflow(`helloworld`, helloworld)

const helloworld = createWorkflow(wf => {
  wf.on(Event.START, async (event) => {
    const { trigger: { args: { source_uri } } } = event
    wf.startInteraction([source_uri], `hello world`)
  })

  wf.on(Event.INTERACTION_STARTED, async ({ source_uri }) => {
    const deviceName = Uri.parseDeviceName(source_uri)
    console.log(`interaction start ${source_uri}`)
    await wf.sayAndWait(source_uri, `What is your name ?`)
    const { text: userProvidedName } = await wf.listen(source_uri)
    const greeting = await wf.getVar(`greeting`)
    await wf.sayAndWait(source_uri, `${greeting} ${userProvidedName}! You are currently using ${deviceName}`)
    await wf.terminate()
  })
})
```

Features demonstrated here:

* When the workflow is triggered, the `start` event is emitted and the registered start callback
  function is called.
* An __interaction__ is started. This creates a temporary channel on the Relay device, which provides
  a sort of "context" in which some device-specific commands are sent.
* Inside the __interaction started__ handler, the workflow prompts with the `sayAndWait` action. The device user will hear text-to-speech.
* The workflow awaits for a response from the device user with the `listen` action.
* A workflow configuration variable `greeting` is retrieved as is the triggering device's name.
* The workflow then again uses text-to-speech to reply with a dynamic message.
* Finally, the workflow is terminated and the device is returned to its original state.

Using the Relay CLI, the workflow can be registered with the following command:

```bash
relay workflow:create:phrase --name my-test-workflow --uri wss://yourhost:port/helloworld --trigger test --install-all
```

In the above sample sample, a workflow callback function is registered with the name `helloworld`. This value
of `helloworld` is used to map a WebSocket connection at the path `wss://yourhost:port/helloworld`
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

## Logging
By default, the relay-js SDK will log minimal output to the console.
relay-js SDK uses the [debug](https://www.npmjs.com/package/debug) module
internally to log information. See its documentation on how it can
integrate with other logging frameworks. You can even use `debug` in your
own application code.

If you would like more detailed logging, especially if you'd like to
troubleshoot event messages passed between your application and Relay
Servers, you can set the `DEBUG` environment variable.

To see all the internal logs used in relay-js SDK, set the `DEBUG`
environment variable to `relay:*` when launching your app:

```bash
$ DEBUG=relay:* node index.js
```

On Windows, use the corresponding command:

```bash
set DEBUG=relay:* & node index.js
```

### Advanced options

When running your app, you can set a few environment variables that will
change the behavior of the debug logging:

| Name | Purpose |
|-|-|
|`DEBUG`| Enables/disables specific debugging namespaces. e.g. `DEBUG=relay:*` |
|`DEBUG_COLORS`| Whether or not to use colors in the debug output. e.g. `DEBUG_COLORS=1` |
|`DEBUG_DEPTH`| Object inspection depth. e.g. `DEBUG_DEPTH=5` |

For more information about debug, see the [debug](https://www.npmjs.com/package/debug).

## Ports, Express and `http.Server`

### Set port by environment variable

By default, relay-js SDK will attempt to open a WebSocket port on `8080`.
This can configured in several ways. If your deployment environment allows
configuring a port through an environment variable, you can set the port
with `PORT`. For instance, the following will change the port the SDK
will open.

```bash
PORT=5080 node index.js
```
### Set port by parameter

Another way to change the port is to pass it into the `relay` function.
For instance, the following will change the port the SDK will open:

```javascript
import pkg from '@relaypro/sdk'
const { relay, Event, createWorkflow, Uri } = pkg

const app = relay({ port: 5080 }) // pass in port number here

app.workflow(wf => {
  wf.on(Event.START, async () => {
    // handle start event
  })
})
```
### Integrate with Express or `http.Server`

Express, and other Node Web Application Frameworks, are a wrapper around
the Node `http.Server` object. The relay-js SDK provided at `@relaypro/sdk`
plays nicely in these environments as it utilizes the lightweight `ws`
WebSocket implementation. As described above, `ws` will listen on the
default 8080 port, or other configured port.

If you are integrating with an existing Web app, or need to do HTTP
handling, instead of the relay-js SDK running on a separate port, you will
most likely want to run on the same port.

This can be accomplished by passing in an `http.Server` instance. For
example, to integreate with an Express app:

```javascript
import express from 'express'

const app = express()
// .listen returns an `http.Server`
const server = app.listen(3000)
const relayApp = relay({ server })
```
By passing in an `http.Server` instance, the relay-js SDK will attach to
it rather than opening its own server and port. While Express is
demonstrated in this example, it is possible to similarly integrate with
other Node Web Application Frameworks that wrap `http.Server`.

## API

The Relay JS SDK covers a broad set of use cases. Explore the various actions that can be performed
in workflow event callbacks:

* [Workflow](https://relaypro.github.io/relay-js/#class-workflow)

The full API reference is available at https://relaypro.github.io/relay-js .

## Workflow Registration

More thorough documentation on how to register your workflow on a Relay device
can be found at [https://developer.relaypro.com/docs/register-workflows](https://developer.relaypro.com/docs/register-workflows)

## Development

```bash
git clone git@github.com:relaypro/relay-js.git
cd relay-js
npm install
npm run build
npm run test
```

## Run a Registered Workflow

```bash
git clone git@github.com:relaypro/relay-js.git
cd relay-js
npm install
npm run build
cd samples
npm install
node index.js
```

## Guides Documentation

The higher-level guides are available at https://developer.relaypro.com/docs

## API Reference Documentation

The generated typedoc documentation is available at https://relaypro.github.io/relay-js/

Explore the various actions that can be performed in workflow event callbacks:
[Workflow](https://relaypro.github.io/relay-js/#class-workflow)

## License
[MIT](https://choosealicense.com/licenses/mit/)
