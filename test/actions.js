// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-var-requires */
const chai = require(`chai`)
const chaiAsPromised = require(`chai-as-promised`)
const { describe } = require(`mocha`)

const WebSocket = require(`ws`)
const { Event } = require(`../dist/enums.js`)
const { relay } = require(`../dist/index.js`)
const { arrayMapper, numberArrayMapper, booleanMapper } = require(`../dist/utils.js`)

chai.use(chaiAsPromised)

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
    app = relay()

    app.workflow(relayAdapter => {
      adapter = relayAdapter
    })

    app.workflow(`tester`, () => { return })

    ibot = new WebSocket(`ws://localhost:8080`)
    ibot.on(`open`, () => {
      done()
    })
    ibot.on(`error`, (error) => {
      console.error(`before hook`, error)
      done()
    })
  })

  afterEach(done => {
    Object.keys(Event).forEach(event => adapter?.off(event))
    done()
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
      { command: `say`, args: { text: `hello, brandon` }, response: { id: `abc` }, assertResponseField: `id` },
      { command: `play`, args: { filename: `123.wav` }, response: { id: `abc` }, assertResponseField: `id` },
      { command: `vibrate`, args: { pattern: [100, 500, 500,  500, 500, 500] }},
      { command: `set_var`, args: { name: `name`, value: `value` } },
      { command: `get_var`, args: { name: `name` }, response: { value: `hello from the other side` }, assertResponseField: `value` },
      { command: `start_timer`, args: { timeout: 60 } },
      { command: `stop_timer`, args: {} },
      { command: `notification`, fn: `broadcast`, args: { name: `name`, text: `hello world`, target: [`all`], type: `broadcast` } },
      { command: `notification`, fn: `notify`, args: { name: `name`, text: `hello world`, target: [`all`], type: `notify` } },
      { command: `notification`, fn: `alert`, args: { name: `name`, text: `hello world`, target: [`all`], type: `alert` } },
      { command: `notification`, fn: `cancelAlert`, args: { name: `name`, target:[`all`]}},
      { command: `set_led`, fn:`switchLedOn`, args: { led: 1, color: `00FF00`}, assertArgs: { effect: `static`, args: { colors: { [`1`]: `00FF00`}}}},
      { command: `set_led`, fn:`switchAllLedOff`, assertArgs: { effect: `off`, args: {}}},
      { command: `set_led`, fn:`switchAllLedOn`, args: { color: `00FF00`}, assertArgs: { effect: `static`, args: { colors: { ring: `00FF00`}}}},
      { command: `set_led`, fn:`rainbow`, args: { rotations: 10}, assertArgs: { effect: `rainbow`, args: { rotations:10 }}},
      { command: `set_led`, fn:`rotate`, assertArgs: { effect: `rotate`, args: { rotations: -1, colors: {[`1`]: `FFFFFF`} }}},
      { command: `set_led`, fn:`flash`, assertArgs: { effect: `flash`, args: { count: -1, colors: {ring: `0000FF`} }}},
      { command: `set_led`, fn:`breathe`, assertArgs: { effect: `breathe`, args: { count: -1, colors: {ring: `0000FF`} }}},
      { command: `create_incident`, args: { type: `tester` }, response: { incident_id: `123abc`}, assertResponseField: `incident_id` },
      { command: `resolve_incident`, args: { incident_id: `tester`, reason: `done` } },
      { command: `set_channel`, args: { channel_name: `channel`, target: [`target`] } },
      { command: `set_device_info`, fn: `setDeviceName`, args: { value: `HAL 9000` }, assertArgs: { field: `label`, value: `HAL 9000`} },
      { command: `set_device_info`, fn: `setDeviceChannel`, args: { value: `some channel` }, assertArgs: { field: `channel`, value: `some channel`} },
      { command: `get_device_info`, fn: `getDeviceBattery`, assertArgs: { query: `battery`, refresh: false }, response: { battery: 75 }, assertResponseField: `battery` },
      { command: `get_device_info`, fn: `getDeviceName`, assertArgs: { query: `name`, refresh: false }, response: { name: `hello` }, assertResponseField: `name` },
      { command: `get_device_info`, fn: `getDeviceBattery`, args: { refresh: true }, assertArgs: { query: `battery`, refresh: true }, response: { battery: 75 }, assertResponseField: `battery` },
      { command: `get_device_info`, fn: `getDeviceLocation`, assertArgs: { query: `address`, refresh: false }, response: { address: `hello` }, assertResponseField: `address` },
      { command: `get_device_info`, fn: `getDeviceAddress`, assertArgs: { query: `address`, refresh: false }, response: { address: `hello` }, assertResponseField: `address` },
      { command: `get_device_info`, fn: `getDeviceId`, assertArgs: { query: `id`, refresh: false }, response: { id: `hello` }, assertResponseField: `id` },
      { command: `get_device_info`, fn: `getDeviceCoordinates`, assertArgs: { query: `latlong`, refresh: false }, response: { latlong: `hello` }, assertResponseField: `latlong` },
      { command: `get_device_info`, fn: `getDeviceLatLong`, assertArgs: { query: `latlong`, refresh: false }, response: { latlong: `hello` }, assertResponseField: `latlong` },
      { command: `get_device_info`, fn: `getDeviceIndoorLocation`, assertArgs: { query: `indoor_location`, refresh: false }, response: { indoor_location: `hello` }, assertResponseField: `indoor_location` },
      { command: `listen`, fn: `listen`, args: { phrases: [`hello`] }, response: { text: `hello`, lang:`en-EN` }, fullResponse:true },
      {
        command: `listen`,
        fn: `listen`,
        args: {
          phrases: [`hello`],
          options: { transcribe: false }
        },
        assertArgs: {
          transcribe: false,
          phrases: [ `hello` ],
          timeout: 60,
          alt_lang: `en-US`
        },
        response: {
          audio: `some base64 encoded value`
        },
        fullResponse:true
      },
      {
        command: `listen`,
        fn: `listen`,
        args: {
          phrases: [`hello`],
          options: { alt_lang: `fr-Fr` }
        },
        assertArgs: {
          transcribe: true,
          phrases: [ `hello` ],
          timeout: 60,
          alt_lang: `fr-Fr`},
        response: {
          text: `some base64 encoded value`,
          lang: `fr-Fr`
        },
        fullResponse:true
      },
      { command: `terminate` },
      { command: `call`, fn: `placeCall` },
      { command: `answer`, fn: `answerCall`, args: { call_id: `123`} },
      { command: `hangup`, fn: `hangupCall`, args: { call_id: `123`} },
      { command: `device_power_off`, fn: `restartDevice`, args: { restart: true} },
      { command: `device_power_off`, fn: `powerDownDevice`, args: { restart: false} },
      { command: `set_home_channel_state`, fn: `enableHomeChannel`, args: { target: `1`}, assertArgs: { target: [`1`], enabled: true } },
      { command: `set_home_channel_state`, fn: `enableHomeChannel`, args: { target: [`1`]}, assertArgs: { target: [`1`], enabled: true } },
      { command: `set_home_channel_state`, fn: `disableHomeChannel`, args: { target: `1`}, assertArgs: { target: [`1`], enabled: false } },
      { command: `set_home_channel_state`, fn: `disableHomeChannel`, args: { target: [`1`]}, assertArgs: { target: [`1`], enabled: false } },
      { command: `log_analytics_event`, fn: `trackEvent`, args: { category: `abc` }, assertArgs: { category: `abc`, content_type: `application/vnd.relay.event.parameters+json`, analytics_content: {} } },
      { command: `log_analytics_event`, fn: `trackEvent`, args: { category: `abc`, parameters: { hello: `world` } }, assertArgs: { category: `abc`, content_type: `application/vnd.relay.event.parameters+json`, analytics_content: { hello: `world` } } },
    ]

    basicCommands.forEach(test => {
      it(`should send '${test.command}'${test.fn ? ` with '${test.fn}'`: ``}`, done => {
        const handler = msg => {
          const message = JSON.parse(msg)
          // console.log(`message`, message)
          expect(message).to.have.property(`_id`)
          expect(message).to.deep.include({ _type: `wf_api_${test.command}_request`, ...(test.assertArgs ?? test.args) })
          const response = {
            _id: message._id,
            _type: `wf_api_${test.command}_response`,
            ...test.response,
          }
          // console.log(`response`, response)
          ibot.send(JSON.stringify(response))
        }

        ibot.on(`message`, handler)

        adapter[test.fn ?? toCamelCase(test.command)](...Object.values(test.args ?? {}))
          .then(result => {
            ibot.off(`message`, handler)
            if (result !== undefined) {
              // console.log(`result`, result)
            }
            try {
              expect(result).to.eql(
                test.fullResponse ? test.response : (test.response?.[test.assertResponseField] ?? undefined))
              done()
            } catch(err) {
              done(err)
            }
          })
      })
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

    describe(`'get' function`, () => {

      const mockValues = {
        name1: `hello from the other side`,
        name2: `hello from the other side, too`,
        number: `3.01`,
        array: `1,2,3`,
        json: `{"hello":"world"}`,
        bool: `true`,
        bool2: `false`,
      }

      const handler = msg => {
        const message = JSON.parse(msg)
        const value = mockValues[message.name]
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_get_var_request` })
        ibot.send(JSON.stringify({
          _id: message._id,
          _type: `wf_api_get_var_response`,
          value,
        }))
      }

      before(() => {
        ibot.on(`message`, handler)
      })

      after(() => {
        ibot.off(`message`, handler)
      })

      it(`should send 'get_var' multiple times for batch 'get'`, async () => {
        try {
          const [val1, val2] = await adapter.get([`name1`, `name2`])
          expect(val1).to.equal(mockValues.name1)
          expect(val2).to.equal(mockValues.name2)
        } catch (err) {
          console.error(err)
        }
      })

      it(`should use provided mappers`, async () => {
        const [val1, val2, val3, val4, val5, val6, val7] = await adapter.get(
          [`name1`, `number`, `array`, `array`, `bool`, `bool2`, `json`],
          [
            String,
            Number,
            arrayMapper,
            numberArrayMapper,
            booleanMapper,
            booleanMapper,
            JSON.parse,
          ]
        )
        expect(val1).to.equal(mockValues.name1)
        expect(val2).to.equal(Number(mockValues.number))
        expect(val2).to.be.a(`number`)
        expect(val3).to.be.an(`array`)
        expect(val3).to.eql([`1`, `2`, `3`])
        expect(val4).to.be.an(`array`)
        expect(val4).to.eql([1, 2, 3])
        expect(val5).to.be.true
        expect(val6).to.be.false
        expect(val7).to.eql({ hello: `world` })
      })
    })

  })

  describe(`Error handling`, () => {

    it(`should return rejected promise when 'get' is called incorrectly`, async () => {
      expect(adapter.get(`hello`, [])).to.be.rejected
    })

    it(`should reject when ibot responds with error_response`, async () => {
      const handler = msg => {
        const message = JSON.parse(msg)
        expect(message).to.have.property(`_id`)
        expect(message).to.deep.include({ _type: `wf_api_get_var_request` })
        ibot.send(JSON.stringify({
          _id: message._id,
          _type: `wf_api_error_response`,
          error: `fake-error`,
        }))
      }

      ibot.on(`message`, handler)

      const p = adapter.get([`hello`])
      return expect(p).to.eventually.be.rejectedWith(Error)
    })

    it(`should emit 'error' event handler doesn't catch error`, done => {
      adapter.on(`start`, () => {
        throw new Error(`test`)
      })

      adapter.on(`error`, (error) => {
        expect(error).to.exist
          .and.to.be.an(`error`)
          .and.to.have.property(`message`, `test`)
        done()
      })

      ibot.send(JSON.stringify({ _type: `wf_api_start_event` }))
    })

    it(`should throw an error when registering workflow incorrectly`, done => {
      expect(() => app.workflow()).to.throw(Error)
      expect(() => app.workflow(1)).to.throw(Error)
      expect(() => app.workflow(`hello`)).to.throw(Error)
      done()
    })

    it(`should terminate ws when named workflow does not exist`, done => {
      const client = new WebSocket(`ws://localhost:8080/tester2`)
      client.on(`error`, error => {
        expect(error).to.exist
          .and.to.be.an(`error`)
          .and.to.have.property(`message`, `Unexpected server response: 400`)
      })
      client.on(`close`, (code) => {
        expect(code).to.eq(1006)
        done()
      })
    })

    it(`should throw error when initializing relay sdk multiple times`, done => {
      expect(() => relay()).to.throw(Error)
      done()
    })
  })

})
