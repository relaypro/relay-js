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

    it(`should send data for request 'cast' request over websocket`, done => {
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.include({ _type: `wf_api_test_request`, val: `val` })
        done()
      })
      adapter.send(`test`, { val: `val` })
    })

    it(`should send and receive for 'call' request over websocket`, done => {
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_test_request`, val: `val` })
        done()
      })
      adapter.sendReceive(`test`,  { val: `val` })
    })

    it(`should send 'say'`, done => {
      const text = `hello, brandon`
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_say_request`, text })
        done()
      })
      adapter.say(text)
    })

    it(`should send 'play'`, done => {
      const filename = `123.wav`
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_play_request`, filename })
        done()
      })
      adapter.play(filename)
    })

    it(`should send 'vibrate'`, done => {
      const pattern = [100, 500, 500,  500, 500, 500]
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_vibrate_request`, pattern })
        done()
      })
      adapter.vibrate(pattern)
    })

    it(`should send 'set_led'`, done => {
      const effect = `rainbow`
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_set_led_request`, effect, args: {} })
        done()
      })
      adapter.setLED(effect)
    })

    it(`should send 'set_var'`, done => {
      const name = `name`
      const value = `value`
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_set_var_request`, name, value })
        done()
      })
      adapter.setVar(name, value)
    })

    it(`should send 'get_var'`, done => {
      const name = `name`
      const value = `hello from the other side`
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_get_var_request`, name })
        ibot.send(JSON.stringify({
          _id: message._id,
          _type: `wf_api_get_var_response`,
          value,
        }))
      })
      adapter.getVar(name)
        .then(val => {
          expect(val).to.equal(value)
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

    it(`should send 'start_timer'`, done => {
      const timeout = 60
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_start_timer_request`, timeout })
        done()
      })
      adapter.startTimer(timeout)
    })

    it(`should send 'stop_timer'`, done => {
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_stop_timer_request` })
        done()
      })
      adapter.stopTimer()
    })

    it(`should send 'notification' of type 'broadcast'`, done => {
      const text = `hello world`
      const target = [`all`]
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_notification_request`, type: `broadcast`, text, target })
        done()
      })
      adapter.broadcast(text, target)
    })

    it(`should send 'notification' of type 'background'`, done => {
      const text = `hello world`
      const target = [`all`]
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_notification_request`, type: `background`, text, target })
        done()
      })
      adapter.notify(text, target)
    })

    it(`should send 'notification' of type 'foreground'`, done => {
      const text = `hello world`
      const target = [`all`]
      ibot.once(`message`, msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_notification_request`, type: `foreground`, text, target })
        done()
      })
      adapter.alert(text, target)
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
  })

})
