import { randomBytes } from 'crypto'
import { TextDecoder } from 'util'
import { AnyPrimitive, Device, RawWorkflowEvent } from './types'

const decoder = new TextDecoder()
const ensureString = (possibleString: unknown) => {
  if (Array.isArray(possibleString) && possibleString.every(e => Number.isInteger(e) && e >= 0 && e <= 127)) {
    return decoder.decode(Uint8Array.from(possibleString))
  } else {
    return possibleString
  }
}

/**
 * @internal
 */
export const safeParse = (msg: string): undefined | RawWorkflowEvent => {
  try {
    return JSON.parse(msg, (_, value) => {
      return value && ensureString(value)
    })
  } catch(err) {
    console.log(`failed to parse message =>`, msg)
    return undefined
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

/*
 * Only matches against primitives, not nested array or objects
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isMatch = (object: any, source: any) => {
  if (object === source) {
    return true
  }

  if (!isPlainObject(source)) {
    return false
  }

  return Object.keys(source).every(key => source[key] === object[key])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapDevice = (device: Record<string, any>): Device => {

  const info = device?.device_details?.device_info
  const location = device.device_details?.location

  return {
    name: device.device_label,
    last_connect_timestamp: device.last_connect_timestamp,
    active_channel: device.active_channel,
    status: device.device_status,
    mode: device.mode === `undefined` ? null : device.mode,
    background_audio: device.background_audio,
    ...(info && {
      battery_level: info.battery_level,
      battery_status: info.battery_status,
      rom_version: info.rom_version,
      app_version: info.app_version,
      apk_version: info.app_version,
      build_id: info.build_id,
      product_name: info.product_name,
      model: info.model,
      wifi_mac: info.wifi_mac,
      volume_level: info.volume_level,
      imei: info.imei,
      iccid: info.iccid,
      fcc_id: info.fcc_id,
      ic_id: info.ic_id,
      connection_type: info.network_status.connection_type,
      wifi_signal: info.network_status.wifi_bars,
      cell_signal: info.network_status.cell_bars,
      bluetooth_status: info.bluetooth_status,
      bluetooth_address: info.bluetooth_info?.address,
      bluetooth_name: info.bluetooth_info?.name
    }),
    location: location ? {
      lat: location.lat,
      long: location.long,
      accuracy: location.accuracy,
      address: location.address || null,
      indoor_position: location.indoor_position,
      date: new Date(Date.parse(`${location.timestamp}Z`)).toUTCString(),
      geofence_state: location.geofence_state ?? null,
      geofence_id: location.geofence_id ?? [],
      geofence_events: location.geofence_events ?? [],
    } : null,
    features: device.features,
    capabilities: device.capabilities,
    groups: device.groups,
    channels: device.channels,
    emergency_info: device.emergency_info,
    active_incidents: device.active_incidents,
  }

  return device as Device
}
