interface Params {
  max?: number
}

type fn = { (): PromiseLike<void> }

export default class Queue {

  private max: number
  private numActive: number
  private queue: fn[]

  constructor(params: Params={}) {
    const { max=1 } = params
    this.max = max
    this.numActive = 0
    this.queue = []
  }

  private next() {
    if (this.queue.length) {
      if (this.numActive < this.max) {
        const fn = this.queue.shift()
        fn && this.execute(fn)
      }
    }
  }

  private execute(fn: fn) {
    this.numActive++
    new Promise<void>(resolve => {
      const obj = fn()
      if (typeof obj?.then === `function`) {
        resolve()
      }
    }).finally(() => {
      this.numActive--
      this.next()
    })
  }

  enqueue(fn: fn): void {
    this.queue.push(fn)
    this.next()
  }
}
