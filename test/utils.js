// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-var-requires */
const chai = require(`chai`)

const { noop, safeParse, toString, arrayMapper, numberArrayMapper, booleanMapper } = require(`../dist/utils`)

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

})
