// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-var-requires */
const chai = require(`chai`)

const WebSocket = require(`ws`)
const { relay } = require(`../dist/index.js`)

const { expect } = chai

const toCamelCase = s => {
  return s.replace(/([-_][a-z])/ig, match => {
    return match.toUpperCase()
      .replace(`-`, ``)
      .replace(`_`, ``)
  })
}

describe(`Events API Tests`, () => {
  let app = undefined
  let adapter = undefined
  let ibot = undefined

  before(done => {
    app = relay({ STRICT_PATH: `0`})

    app.workflow(relayAdapter => {
      adapter = relayAdapter
    })

    ibot = new WebSocket(`ws://localhost:8080`)
    ibot.on(`open`, () => {
      done()
    })
  })

  after(done => {
    adapter?.stop?.()
    ibot?.close?.()
    done()
  })

  describe(`top-level events`, () => {

    it(`should emit 'start' when receiving start event`, done => {
      adapter.on(`start`, () => {
        done()
      })

      ibot.send(JSON.stringify({ _type: `wf_api_start_event` }))
    })

    it(`should emit 'timer' when receiving timer event`, done => {
      adapter.on(`timer`, () => {
        done()
      })

      ibot.send(JSON.stringify({ _type: `wf_api_timer_event` }))
    })

    it(`should emit 'button' when receiving button event`, done => {
      adapter.on(`button`, ({ button, taps }) => {
        console.log(`button`, button)
        expect(button).to.equal(`channel`)
        expect(taps).to.equal(`single`)
        done()
      })

      ibot.send(JSON.stringify({ _type: `wf_api_button_event`, button: `channel`, taps: `single` }))
    })

    it(`should emit 'notification' when receiving notification event`, done => {
      adapter.on(`notification`, ({ source, name, event, notification_state }) => {
        expect(source).to.equal(`someone`)
        expect(name).to.equal(`name`)
        expect(event).to.equal(`unknown`)
        expect(notification_state).to.deep.equal({})
        done()
      })

      ibot.send(JSON.stringify({ _type: `wf_api_notification_event`, source: `someone`, name: `name`, event: `unknown`, notification_state: {} }))
    })

  })

  describe(`send and receive api requests`, () => {

    const basicCommands = [
      { command: `say`, args: { text: `hello, brandon` } },
      { command: `play`, args: { filename: `123.wav` } },
      { command: `vibrate`, args: { pattern: [100, 500, 500,  500, 500, 500] }},
      { command: `set_var`, args: { name: `name`, value: `value` } },
      { command: `get_var`, args: { name: `name` }, response: { value: `hello from the other side` }, assertResponseField: `value` },
      { command: `start_timer`, args: { timeout: 60 } },
      { command: `stop_timer`, args: {} },
      { command: `notification`, fn: `broadcast`, args: { text: `hello world`, target: [`all`], type: `broadcast` } },
      { command: `notification`, fn: `notify`, args: { text: `hello world`, target: [`all`], type: `notify` } },
      { command: `notification`, fn: `alert`, args: { name: `name`, text: `hello world`, target: [`all`], type: `alert` } },
      { command: `set_led`, fn:`switchLedOn`, args: { led: 1, color: `00FF00`}, assertArgs: { effect: `static`, args: { colors: { [`1`]: `00FF00`}}}},
      { command: `set_led`, fn:`switchAllLedOn`, args: { color: `00FF00`}, assertArgs: { effect: `static`, args: { colors: { ring: `00FF00`}}}},
      { command: `set_led`, fn:`rainbow`, args: { rotations: 10}, assertArgs: { effect: `rainbow`, args: { rotations:10 }}},
      { command: `set_led`, fn:`rotate`, args: {}, assertArgs: { effect: `rotate`, args: { rotations: -1, colors: {[`1`]: `FFFFFF`} }}},
      { command: `set_led`, fn:`flash`, args: {}, assertArgs: { effect: `flash`, args: { count: -1, colors: {ring: `0000FF`} }}},
      { command: `set_led`, fn:`breathe`, args: {}, assertArgs: { effect: `breathe`, args: { count: -1, colors: {ring: `0000FF`} }}},
      { command: `create_incident`, args: { type: `tester` }, response: { incident_id: `123abc`}, assertResponseField: `incident_id` },
      { command: `resolve_incident`, args: { incident_id: `tester`, reason: `done` } },
      { command: `set_channel`, args: { channel_name: `channel`, target: [`target`] } },
      { command: `set_device_info`, fn: `setDeviceName`, args: { value: `HAL 9000` }, assertArgs: { field: `label`, value: `HAL 9000`} },
      { command: `set_device_info`, fn: `setDeviceChannel`, args: { value: `some channel` }, assertArgs: { field: `channel`, value: `some channel`} },
      { command: `get_device_info`, fn: `getDeviceBattery`, args: {}, assertArgs: { query: `battery`, refresh: false }, response: { battery: 75 }, assertResponseField: `battery` },
      { command: `get_device_info`, fn: `getDeviceBattery`, args: { refresh: true }, assertArgs: { query: `battery`, refresh: true }, response: { battery: 75 }, assertResponseField: `battery` },
    ]

    basicCommands.forEach(test => {
      it(`should send '${test.command}'`, done => {
        const handler = msg => {
          const message = JSON.parse(msg)
          // console.log(`message`, message)
          expect(message).to.have.property(`_id`)
          expect(message).to.deep.include({ _type: `wf_api_${test.command}_request`, ...(test.assertArgs ?? test.args) })
          ibot.send(JSON.stringify({
            _id: message._id,
            _type: `wf_api_${test.command}_response`,
            ...test.response,
          }))
        }

        ibot.on(`message`, handler)

        adapter[test.fn ?? toCamelCase(test.command)](...Object.values(test.args))
          .then(result => {
            ibot.off(`message`, handler)
            if (result !== undefined) {
              // console.log(`result`, result)
            }
            try {
              expect(result).to.equal(test.response?.[test.assertResponseField] ?? undefined)
              done()
            } catch(err) {
              console.error(err)
            }
          })
      })
    })

    it(`should send 'terminate'`, done => {
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_terminate_request` })
        done()
      })
      adapter.terminate()
    })

    it(`should send 'listen'`, done => {
      const transcribe = true
      const timeout = 60
      const phrases = [`hello`]
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_listen_request`, phrases, transcribe, timeout })
        ibot.send(JSON.stringify({
          _id: message._id,
          _type: `wf_api_listen_response`,
          text: `hello`,
          audio: `dflkajdslk`
        }))
      })
      adapter.listen(phrases)
        .then(message => {
          expect(message).to.deep.equal({ text: `hello` })
          done()
        })
        .catch(done)
    })

    it(`should send 'set_var' multiple times for batch 'set'`, done => {
      const name1 = `name1`
      const value1 = `value1`
      const name2 = `name2`
      const value2 = `value2`
      const handler = msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        if (message.name === `name1`) {
          expect(message).to.deep.include({ _type: `wf_api_set_var_request`, name: name1, value: value1 })
        } else if (message.name === `name2`) {
          expect(message).to.deep.include({ _type: `wf_api_set_var_request`, name: name2, value: value2 })
        }
        ibot.send(JSON.stringify({
          _id: message._id,
          _type: `wf_api_set_var_response`,
        }))
      }

      ibot.on(`message`, handler)

      adapter.set({ [name1]: value1, [name2]: value2 })
        .then(() => {
          ibot.off(`message`, handler)
          done()
        })
    })

    it(`should send 'get_var' multiple times for batch 'get'`, done => {
      const name1 = `name1`
      const value1 = `hello from the other side`

      const name2 = `name2`
      const value2 = `hello from the other side, too`

      const handler = msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_get_var_request` })
        ibot.send(JSON.stringify({
          _id: message._id,
          _type: `wf_api_get_var_response`,
          value: message.name === name1 ? value1 : value2,
        }))
      }
      ibot.on(`message`, handler)
      adapter.get([name1, name2])
        .then(([val1, val2]) => {
          ibot.off(`message`, handler)
          expect(val1).to.equal(value1)
          expect(val2).to.equal(value2)
          done()
        })
    })

  })

})
