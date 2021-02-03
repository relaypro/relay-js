import { randomBytes } from 'crypto'
import { Msg } from './types'

export const safeParse = (msg: string): undefined | Msg => {
  try {
    return JSON.parse(msg)
  } catch(err) {
    console.log(`failed to parse message =>`, msg)
    return
  }
}

export const noop = (): void => { return }

export const makeId = (): string => randomBytes(16).toString(`hex`)

// export const promiseTry = (func: Function) => new Promise((resolve) => resolve(func()))
