import { URL, URLSearchParams } from 'url'

import { InteractionLifecycle, Target, TargetUris } from './types'

const SCHEME = `urn`
const ROOT = `relay-resource`
const ID = `id`
const NAME = `name`
const ALL = `all`

const allDevicesOnAcct = `urn:relay-resource:${ALL}:device`
const INTERACTION_ROOT = `urn:relay-resource:name:interaction`

const encode = (value: string | number | boolean) => encodeURIComponent(value)

type Filter = Record<string, string>

// examples:
//   urn:relay-resource:name:group:security
//   urn:relay-resource:name:device:johnny
const construct = (resourceType: string, idType: string, idOrName: string, filter?: Filter) => {
  if (!idOrName) {
    throw new Error(`invalid_relay_uri_id_or_name`)
  }
  const uri = `${SCHEME}:${ROOT}:${idType}:${resourceType}:${encode(idOrName)}`
  if (filter) {
    const params = (new URLSearchParams(filter)).toString()
    if (params) {
      return `${uri}?${params}`
    }
  }
  return uri
}

const parseSearchParams = (params: URLSearchParams): Filter => {
  const _params: Filter = {}
  for (const [key, value] of params) {
    _params[key] = value
  }
  return _params
}

const parse = (uri: string): [string, string, string|undefined, Filter] => {
  const parts = new URL(uri)
  const [, idType, resourceType, idOrName] = parts.pathname.split(`:`)
  if (!!idType && !!resourceType && !!idOrName) {
    if (idType === ALL) {
      // i.e. [`group`, `all`, undefined, {}]
      return [resourceType, ALL, undefined, {}]
    }
    // i.e. [`group`, `name`, `security`, {}]
    // i.e. [`device`, `name`, `johnny`, {}]
    return [resourceType, idType, idOrName, parseSearchParams(parts.searchParams)]
  } else {
    throw new Error(`invalid_relay_uri`)
  }
}

const parseDeviceName = (uri: string): string|undefined => {
  const [resourceType, , idOrName, filter] = parse(uri)
  if (resourceType === `device`) {
    return idOrName
  } else if (resourceType === `interaction`) {
    const device = filter[`device`]
    if (!device) {
      throw new Error(`invalid_relay_uri`)
    } else {
      return parseDeviceName(device)
    }
  } else {
    throw new Error(`invalid_relay_uri`)
  }
}

const parseGroupName = (uri: string): string|undefined => {
  const [resourceType, , idOrName] = parse(uri)
  if (resourceType === `group`) {
    return idOrName
  } else {
    throw new Error(`invalid_relay_uri`)
  }
}

const groupId = (id: string) => construct(`group`, ID, id)
const groupName = (name: string) => construct(`group`, NAME, name)
const groupMember = (group: string, device: string) => construct(`group`, NAME, group, { device: deviceName(device)})

const deviceId = (id: string) => construct(`device`, ID, id)
const deviceName = (name: string) => construct(`device`, NAME, name)

const allDevicesWithStatus = (interactionName: string, status: InteractionLifecycle) => {
  if (!status) {
    throw new Error(`invalid_status`)
  }
  return construct(`interaction`, NAME, interactionName, { status })
}

const allDevices = () => allDevicesOnAcct

const genericOriginator = () => construct(`server`, NAME, `ibot`)

const assertTargets = (target: Target): boolean => {
  if (Array.isArray(target) && target.every(e => typeof e === `string` && isRelayUri(e))) {
    return true
  } else {
    console.error(`invalid-target-uris => ${target}`)
    throw new Error(`invalid-target-uris`)
  }
}

const makeTargetUris = (target: Target): TargetUris => {
  const uris = (Array.isArray(target) ? target : [target])
  assertTargets(uris)
  return { uris }
}

// const assertInteractionTargets = (target: Target) => {

// }

const isInteractionUri = (uri: string) => {
  !!uri?.startsWith(INTERACTION_ROOT) && ((uri?.split(`:`).length - 1) >= 3)
}

const isRelayUri = (uri: string) => {
  return !!uri?.startsWith(`urn:${ROOT}`) && ((uri?.split(`:`).length - 1) >= 3)
}

export {
  isInteractionUri,
  isRelayUri,
  assertTargets,
  makeTargetUris,
  parseDeviceName,
  parseGroupName,
  groupId,
  groupName,
  groupMember,
  deviceId,
  deviceName,
  allDevicesWithStatus,
  allDevices,
  genericOriginator,
}
