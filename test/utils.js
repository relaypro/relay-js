// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-var-requires */
const chai = require(`chai`)

const { noop, safeParse, toString, arrayMapper, numberArrayMapper, booleanMapper, isMatch } = require(`../dist/utils`)

const { expect } = chai

describe(`Utils Tests`, () => {

  describe(`noop`, () => {
    it(`should not return anything`, done => {
      expect(noop()).to.not.exist
      done()
    })
  })

  describe(`safeParse`, () => {
    it(`should return undefined on failure`, done => {
      expect(safeParse(`{ hello }`)).to.not.exist
      done()
    })

    it(`should return erlang char lists as strings`, done => {
      expect(safeParse(`{"hello": [116,101,115,116]}`).hello).to.eql(`test`)
      const obj = safeParse(`{"trigger":{"args":{"phrase":[116,101,115,116],"source_uri":[117,114,110,58,114,101,108,97,121,45,114,101,115,111,117,114,99,101,58,110,97,109,101,58,100,101,118,105,99,101,58,67,97,109,100,101,110]},"type":"phrase"}}`)
      expect(obj.trigger.args.phrase).to.eql(`test`)
      expect(obj.trigger.args.source_uri).to.eql(`urn:relay-resource:name:device:Camden`)
      done()
    })
  })

  describe(`toString`, () => {
    const sym = Symbol(`sym`)
    it(`should return a number as string`, async () => {
      expect(toString(0)).to.equal(`0`)
      expect(toString(10)).to.equal(`10`)
      expect(toString(0xFF)).to.equal(`255`)
      expect(toString(-0)).to.equal(`-0`)
    })

    it(`should return a string as string`, async () => {
      expect(toString(`hello`)).to.equal(`hello`)
    })

    it(`should return an array as comma seprated list`, async () => {
      expect(toString([1, 2, true, `hello`, sym])).to.equal(`1,2,true,hello,Symbol(sym)`)
    })

    it(`should return a symbol as string`, async () => {
      expect(toString(sym)).to.equal(`Symbol(sym)`)
    })

    it(`should return something for an object`, async () => {
      expect(toString({ hello: `world` })).to.equal(`{"hello":"world"}`)
    })

    it(`should return a boolean`, async () => {
      expect(toString(true)).to.equal(`true`)
      expect(toString(false)).to.equal(`false`)
    })
  })

  describe(`mappers`, () => {
    it(`should return a array of strings`, async () => {
      expect(arrayMapper(`1,2,3`)).to.eql([`1`, `2`, `3`])
    })

    it(`should return a array of numbers`, async () => {
      expect(numberArrayMapper(`1,2,3`)).to.eql([1,2,3])
    })

    it(`should map string to boolean value`, async () => {
      // only thing that returns `true` is `"true"`
      expect(booleanMapper(`true`)).to.equal(true)
      expect(booleanMapper(`false`)).to.equal(false)
      expect(booleanMapper(``)).to.equal(false)
      expect(booleanMapper(`True`)).to.equal(false)
      expect(booleanMapper(`YES`)).to.equal(false)
    })
  })

  describe(`isMatch`, () => {

    const tests = [
      [true, `empty source`, { hello: `world` }, {}],
      [true, `exact`, { hello: `world` }, { hello: `world` }],
      [false, `not exact`, { hello: `world` }, { world: `hello` }],
      [true, `object has more properties and should match`, { hello: `world`, something: `special`, right: true }, { hello: `world` }],
      [false, `source has more properties and should NOT match`, { hello: `world` }, { hello: `world`, something: `special` }],
      [true, `same properties and should match`, { hello: `world`, num: 420, bool: true }, { hello: `world`, num: 420, bool: true }],
      [false, `same properties and only boolean is different`, { hello: `world`, num: 420, bool: true }, { hello: `world`, num: 420, bool: false }],
      [false, `same properties and only number is different`, { hello: `world`, num: 420, bool: true }, { hello: `world`, num: 123, bool: true }],
      [false, `same properties and only string is different`, { hello: `world`, num: 420, bool: true }, { hello: `world2`, num: 420, bool: true }],
    ]

    it(`should match correctly`, done => {
      tests.forEach(([expectedResult, test, object, source]) => {
        expect(isMatch(object, source), test).to.equal(expectedResult)
      })
      done()
    })

    it(`should return false if match is not an object`, done => {
      const obj = { hello: `world` }
      expect(isMatch(obj, `string`)).to.be.false
      expect(isMatch(obj, true)).to.be.false
      expect(isMatch(obj, false)).to.be.false
      expect(isMatch(obj, [])).to.be.false
      expect(isMatch(obj, class {})).to.be.false
      done()
    })
  })

})
