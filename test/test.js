import chai from 'chai'

import WebSocket from 'ws'
import relay from '../index.js'

// const should = chai.should()
const { expect } = chai

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
    // client.on(`message`, (msg) => console.log(`message`, msg))
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
      adapter.on(`button`, (button, taps) => {
        expect(button).to.equal(`channel`)
        expect(taps).to.equal(`single`)
        done()
      })

      ibot.send(JSON.stringify({ _type: `wf_api_button_event`, button: `channel`, taps: `single` }))
    })

    it(`should emit 'notification' when receiving notification event`, done => {
      adapter.on(`notification`, (source, event) => {
        expect(source).to.equal(`someone`)
        expect(event).to.equal(`unknown`)
        done()
      })

      ibot.send(JSON.stringify({ _type: `wf_api_notification_event`, source: `someone`, event: `unknown` }))
    })

  })

  describe(`send and receive api requests`, () => {

    const basicCommands = [
      { command: `say`, args: { text: `hello, brandon` } },
      { command: `play`, args: { filename: `123.wav` } },
      { command: `vibrate`, args: { pattern: [100, 500, 500,  500, 500, 500] }},
      { command: `set_led`, fn: `setLED`, args: { effect: `rainbow` } },
      { command: `set_var`, fn: `setVar`, args: { name: `name`, value: `value` } },
      { command: `get_var`, fn: `getVar`, args: { name: `name` }, response: { value: `hello from the other side` } },
      { command: `start_timer`, fn: `startTimer`, args: { timeout: 60 } },
      { command: `stop_timer`, fn: `stopTimer`, args: {} },
      { command: `notification`, fn: `broadcast`, args: { text: `hello world`, target: [`all`]}, type: `broadcast` },
      { command: `notification`, fn: `notify`, args: { text: `hello world`, target: [`all`]}, type: `background` },
      { command: `notification`, fn: `alert`, args: { text: `hello world`, target: [`all`]}, type: `foreground` },
    ]

    basicCommands.forEach(test => {
      it(`should send '${test.command}'`, done => {
        const handler = msg => {
          const message = JSON.parse(msg)
          // console.log(`message`, message)
          expect(message).to.have.property(`_id`)
          expect(message).to.deep.include({ _type: `wf_api_${test.command}_request`, ...test.args })
          ibot.send(JSON.stringify({
            _id: message._id,
            _type: `wf_api_${test.command}_response`,
            ...test.response,
          }))
        }

        ibot.on(`message`, handler)

        adapter[test.fn ?? test.command](...Object.values(test.args))
          .then(result => {
            ibot.off(`message`, handler)
            // console.log(`result`, result)
            expect(result).to.equal(test?.response?.value ?? true)
            done()
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
          expect(message).to.deep.equal(`hello`)
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

    it(`should send 'get_device_info_request'`, done => {
      const query = `battery`
      const refresh = true
      const battery = 24
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_get_device_info_request`, query, refresh })
        ibot.send(JSON.stringify({
          _id: message._id,
          _type: `wf_api_get_device_info_response`,
          name: `battery`,
          battery,
        }))
      })
      adapter.getDeviceBattery(refresh)
        .then(val => {
          expect(val).to.equal(battery)
          done()
        })
        .catch(done)
    })

    it(`should send 'set_device_info_request'`, done => {
      const field = `name`
      const value = `HAL 9000`
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_set_device_info_request`, field, value })
        ibot.send(JSON.stringify({
          _id: message._id,
          _type: `wf_api_set_device_info_response`,
        }))
      })
      adapter.setDeviceName(value)
        .then(() => {
          done()
        })
        .catch(done)
    })

  })

})
