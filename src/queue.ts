interface Params {
  max?: number
}

type work = { (): PromiseLike<void> }

export default class Queue {

  private max: number
  private numActive: number
  private queue: work[]

  constructor(params: Params={}) {
    const { max=1 } = params
    this.max = max
    this.numActive = 0
    this.queue = []
  }

  private next() {
    // console.log(`${this.queue.length} : ${this.numActive} : ${this.max}`)
    if (this.queue.length) {
      if (this.numActive < this.max) {
        const fn = this.queue.shift()
        fn && this.execute(fn)
      }
    }
  }

  private execute(fn: work) {
    this.numActive++
    new Promise<void>(resolve => {
      const obj = fn()
      if (typeof obj?.then === `function`) {
        obj.then(() => {
          resolve()
        })
      }
    }).finally(() => {
      this.numActive--
      this.next()
    })
  }

  enqueue(fn: work): void {
    this.queue.push(fn)
    this.next()
  }
}
