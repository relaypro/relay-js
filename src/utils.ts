import { randomBytes } from 'crypto'
import { AnyPrimitive, Msg } from './types'

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

export const filterInt = (value: string): number => {
  if (/^[-+]?(\d+|Infinity)$/.test(value)) {
    return Number(value)
  } else {
    return NaN
  }
}

export const arrayMapper = (value: string): string[] => value.split(`,`)
export const numberArrayMapper = (value: string): number[] => arrayMapper(value).map(Number)
export const booleanMapper = (value: string): boolean => value === `true`

export const toString = (value: AnyPrimitive): string => {
  return value == null ? `` : baseToString(value)
}

const baseToString = (value: AnyPrimitive): string => {
  if (typeof value == `string`) {
    return value
  }
  if (Array.isArray(value)) {
    return value.map(baseToString) + ``
  }
  if (typeof value == `symbol`) {
    return value.toString()
  }
  if (isPlainObject(value)) {
    return JSON.stringify(value)
  }
  const result = (value + ``)
  if (typeof value == `number`) {
    return (result == `0` && (1 / value) == -Infinity) ? `-0` : result
  }
  return result
}

export const isPlainObject = <Value>(value: unknown): value is Record<string | number | symbol, Value> => {

  if (Object.prototype.toString.call(value) !== `[object Object]`) {
    return false
  }

  const proto = Object.getPrototypeOf(value)
  return proto === null || proto === Object.prototype
}
