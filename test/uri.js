// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-var-requires */
const chai = require(`chai`)

const {
  isInteractionUri,
  isRelayUri,
  allDevices,
  allDevicesWithStatus,
  groupMember,
  deviceName,
  genericOriginator,
  deviceId,
  groupId,
  groupName,
  parseGroupName,
  parseDeviceName
} = require(`../dist/uri`)

const { expect } = chai

describe(`Uri Tests`, () => {

  describe(`isRelayUri`, () => {
    it(`should return false for non-relay uris`, done => {
      const uris = [
        undefined,
        null,
        ``,
        `hello`,
        `urn`,
        `urn:relay-resource`,
      ]

      for (let uri of uris) {
        expect(isRelayUri(uri)).to.be.false
      }

      done()
    })

    it(`should return true for relay uris`, done => {
      const uris = [
        allDevices(),
        groupMember(`security`, `johnny`),
        deviceName(`johnny`),
        allDevicesWithStatus(`hello`, `started`),
      ]

      for (let uri of uris) {
        expect(isRelayUri(uri)).to.be.true
      }

      done()
    })
  })

  describe(`isInteractionUri`, () => {
    it(`should return false for non-interaction uris`, done => {
      const uris = [
        undefined,
        null,
        ``,
        `hello`,
        `urn`,
        `urn:relay-resource`,
        allDevices(),
        groupMember(`security`, `johnny`),
        deviceName(`johnny`),
      ]

      for (let uri of uris) {
        expect(isInteractionUri(uri)).to.be.false
      }

      done()
    })

    it(`should return true for interaction uris`, done => {
      const uris = [
        allDevicesWithStatus(`hello`, `started`),
      ]

      for (let uri of uris) {
        expect(isInteractionUri(uri)).to.be.true
      }

      done()
    })
  })

  describe(`urn builders`, () => {
    it(`should format a proprer uri`, done => {
      expect(allDevices()).to.eq(`urn:relay-resource:all:device`)
      expect(genericOriginator()).to.eq(`urn:relay-resource:name:server:ibot`)
      expect(allDevicesWithStatus(`hello`, `started`))
        .to.eql(`urn:relay-resource:name:interaction:hello?status=started`)
      expect(deviceName(`johnny`)).to.eq(`urn:relay-resource:name:device:johnny`)
      expect(deviceName(`johnny five`)).to.eq(`urn:relay-resource:name:device:johnny%20five`)
      expect(deviceId(`9900000123`)).to.eq(`urn:relay-resource:id:device:9900000123`)
      expect(groupId(`abc`)).to.eq(`urn:relay-resource:id:group:abc`)
      expect(groupName(`abc`)).to.eq(`urn:relay-resource:name:group:abc`)
      expect(groupMember(`abc`, `xyz`)).to.eq(`urn:relay-resource:name:group:abc?device=urn%3Arelay-resource%3Aname%3Adevice%3Axyz`)
      done()
    })

    it(`should throw on missing arguments`, done => {
      const fnsExpectingArgs = [
        deviceId,
        deviceName,
        groupId,
        groupName,
        groupMember,
      ]

      for (let fn of fnsExpectingArgs) {
        expect(() => fn()).to.throw(Error, `invalid_relay_uri_id_or_name`)
      }

      expect(() => allDevicesWithStatus()).to.throw(Error, `invalid_status`)
      expect(() => allDevicesWithStatus(`hello`)).to.throw(Error, `invalid_status`)
      expect(() => groupMember(`security`)).to.throw(Error, `invalid_relay_uri_id_or_name`)

      done()
    })
  })

  describe(`urn parsing`, () => {
    it(`should parse proprer uri`, done => {
      expect(parseGroupName(`urn:relay-resource:name:group:abc`)).to.eq(`abc`)
      expect(parseDeviceName(`urn:relay-resource:name:device:abc`)).to.eq(`abc`)
      expect(parseDeviceName(`urn:relay-resource:name:interaction:hello%20world?device=urn%3Arelay-resource%3Aname%3Adevice%3ACamden`)).to.eq(`Camden`)
      done()
    })


    it(`should throw on improprer uri`, done => {
      const badGroupNames = [
        allDevices(),
        `urn:relay-resource:name:device`,
        `urn:relay-resource:name:device:abc`,
        `urn:relay-resource:name`,
        `urn:relay-resource:name:group`,
      ]

      for (let uri of badGroupNames) {
        expect(() => parseGroupName(uri))
          .to.throw(Error, `invalid_relay_uri`)
      }

      // expect(() => parseDeviceName(`urn:relay-resource:name:group:abc`))
      //   .to.throw(Error, `invalid_relay_uri`)
      done()
    })
  })

})


//
