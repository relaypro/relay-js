# relay-js

relay-js SDK is a node.js library for interacting with Relay. For full documentation visit [api-docs.relaypro.com](https://api-docs.relaypro.com)

## Installation

```bash
npm install @relaypro/sdk 
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

## Workflow Registration

To register your workflow on a Relay device see https://api-docs.relaypro.com/docs/register-workflows


## Development

```bash
git clone git@github.com:relaypro/relay-js.git
cd relay-js
npm install
npm test
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
