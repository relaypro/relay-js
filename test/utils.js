// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-var-requires */
const chai = require(`chai`)

const { noop, safeParse } = require(`../dist/utils`)

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


})
