# relay-js

relay-js SDK is a node.js library for interacting with Relay.

## Installation

```bash
npm install git+https@bitbucket.org:republicwireless/relay-js.git
```

## Usage

```javascript
import relay from 'relay-js'

const app = relay()

app.workflow(`helloworld`, workflow => {
  workflow.on(`start`, async () => {
    workflow.say(`This is a default workflow`)
    workflow.terminate()
  })
})
```

## ibot Configuration

Configuration a Relay to trigger a workflow, and thus connect
to a running Node.js process leveraging the relay-js SDK
is currently still "involved". Consult the ibot team.

## Development

```bash
git clone git@bitbucket.org:republicwireless/relay-js.git
cd relay-js
npm install
npm test
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
