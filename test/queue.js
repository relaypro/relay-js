// Copyright © 2022 Relay Inc.

// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-var-requires */
const chai = require(`chai`)

const Queue = require(`../dist/queue.js`).default

const { expect } = chai

describe(`Queue Tests`, () => {

  let queue = null

  before(done => {
    queue = new Queue()
    done()
  })

  after(done => {
    queue = null
    done()
  })

  describe(`Queue`, () => {

    const num = 100

    it(`should queue work`, function (done) {
      this.timeout(num*num)
      let i = 0
      const loopOrder = []
      const queueOrder = []
      const executeOrder = []
      const timeoutOrder =[]
      while (i < num) {
        const j = i
        i++
        loopOrder.push(j)
        queue.enqueue(() => {
          queueOrder.push(j)
          return new Promise((resolve) => {
            executeOrder.push(j)
            setTimeout(() => {
              timeoutOrder.push(j)
              resolve()
            }, Math.floor(Math.random() * num))
          })
        })
      }


      queue.enqueue(() => {
        expect(loopOrder).to.eql(queueOrder)
        expect(loopOrder).to.eql(executeOrder)
        expect(loopOrder).to.eql(timeoutOrder)
        done()
      })
    })

  })

})
