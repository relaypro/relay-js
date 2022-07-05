// Copyright © 2022 Relay Inc.

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

/**
 * Constructs a URN based off of the resource type, id type, and
 * id/name.  Used by methods that need to create a URN when given a
 * name or ID of a device or group.
 * @param resourceType indicates whether the URN is for a device, group, or interaction.
 * @param idType indicates whether the URN has an ID type of 'name' or 'ID'.
 * @param idOrName the id or name of the device or group.
 * @param filter optional filter.
 * @returns the newly constructed URN.
 */
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

/**
 * Parses out search parameters.
 * @param params the URLSearchParams.
 * @returns the search parameters parsed.
 */
const parseSearchParams = (params: URLSearchParams): Filter => {
  const _params: Filter = {}
  for (const [key, value] of params) {
    _params[key] = value
  }
  return _params
}

/**
 * Helper method for parsing out a URN into its components.
 * @param uri the URN to parse.
 * @returns an array containing the components of the URN.
 */
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

/**
 * Parses out a device name from a device or interaction URN.
 * @param uri the device or interaction URN that you would like to extract the device name from.
 * @returns the device name.
 */
const parseDeviceName = (uri: string): string => {
  const { idType, idOrName } = parseDevice(uri)
  if (idType === NAME) {
    return idOrName
  } else {
    throw new Error(`invalid_relay_uri: name not provided`)
  }
}

/**
 * Parses out a device ID from a device or interaction URN.
 * @param uri the device or interaction URN that you would like to extract the device ID from.
 * @returns the device ID.
 */
const parseDeviceId = (uri: string): string => {
  const { idType, idOrName } = parseDevice(uri)
  if (idType === ID) {
    return idOrName
  } else {
    throw new Error(`invalid_relay_uri: id not provided`)
  }
}

/**
 * Recursively parses out a device from a URN.
 * @param uri the URN to parse.
 * @returns the device.
 */
const parseDevice = (uri: string): Record<`idType`|`idOrName`, string> => {
  const [resourceType, idType, idOrName, filter] = parse(uri)
  if (!idOrName) {
    throw new Error(`invalid_relay_uri: id or name not provided`)
  } else if (resourceType === `device`) {
    return { idType, idOrName }
  } else if (resourceType === `interaction`) {
    const device = filter[`device`]
    if (!device) {
      throw new Error(`invalid_relay_uri`)
    } else {
      return parseDevice(device)
    }
  } else {
    throw new Error(`invalid_relay_uri`)
  }
}

/**
 * Parses out a group name from a group URN.
 * @param uri the URN that you would like to extract the group name from.
 * @returns the group name.
 */
const parseGroupName = (uri: string): string => {
  const { idType, idOrName } = parseGroup(uri)
  if (idType === NAME) {
    return idOrName
  } else {
    throw new Error(`invalid_relay_uri: name not provided`)
  }
}

/**
 * Parses out a group ID from a group URN.
 * @param uri the URN that you would like to extract the group ID from.
 * @returns the group ID.
 */
const parseGroupId = (uri: string): string => {
  const { idType, idOrName } = parseGroup(uri)
  if (idType === ID) {
    return idOrName
  } else {
    throw new Error(`invalid_relay_uri: id not provided`)
  }
}

/**
 * Parses out a group from a URN.
 * @param uri the group URN.
 * @returns the group name or ID.
 */
const parseGroup = (uri: string): Record<`idType`|`idOrName`, string> => {
  const [resourceType, idType, idOrName] = parse(uri)
  if (!idOrName) {
    throw new Error(`invalid_relay_uri: id or name not provided`)
  } else if (resourceType === `group`) {
    return { idType, idOrName }
  } else {
    throw new Error(`invalid_relay_uri`)
  }
}

/**
 * Creates a URN from a group ID.
 * @param id the ID of the group.
 * @returns the newly constructed URN.
 */
const groupId = (id: string) => construct(`group`, ID, id)

/**
 * Creates a URN from a group name.
 * @param name the name of the group.
 * @returns the newly constructed URN.
 */
const groupName = (name: string) => construct(`group`, NAME, name)

/**
 * Creates a URN for a group member.
 * @param group the name of the group that the device belongs to.
 * @param device the device ID or name.
 * @returns the newly constructed URN.
 */
const groupMember = (group: string, device: string) => construct(`group`, NAME, group, { device: deviceName(device)})

/**
 * Creates a URN from a device ID.
 * @param id the ID of the device.
 * @returns the newly constructed URN.
 */
const deviceId = (id: string) => construct(`device`, ID, id)

/**
 * Creates a URN from a device name.
 * @param name the name of the device.
 * @returns the newly constructed URN.
 */
const deviceName = (name: string) => construct(`device`, NAME, name)

/**
 * Returns a URN containing all of the devices with the specified status.
 * @param interactionName the name of the interaction.
 * @param status the status of the devices.
 * @returns a URN containing all of the devices with the status.
 */
const allDevicesWithStatus = (interactionName: string, status: InteractionLifecycle) => {
  if (!status) {
    throw new Error(`invalid_status`)
  }
  return construct(`interaction`, NAME, interactionName, { status })
}

/**
 * Retrieves all of the devices associated with the account.
 * @returns the devices.
 */
const allDevices = () => allDevicesOnAcct

/**
 * Creates a URN containing server information.
 * @returns the newly constructed URN.
 */
const genericOriginator = () => construct(`server`, NAME, `ibot`)

/**
 * Asserts that the specified target URN is valid.
 * @param target the target URN.
 * @returns true if the target URN is valid, throws an 'invalid-target-uris' error otherwise.
 */
const assertTargets = (target: Target): boolean => {
  if (Array.isArray(target) && target.every(e => typeof e === `string` && isRelayUri(e))) {
    return true
  } else {
    console.error(`invalid-target-uris => ${target}`)
    throw new Error(`invalid-target-uris`)
  }
}

/**
 * Creates target URNs and asserts that the targets are valid.  Makes
 * the target into an array if it isn't already.
 * @param target the target URNs.
 * @returns an array representation of the target URNs.
 */
const makeTargetUris = (target: Target): TargetUris => {
  const uris = (Array.isArray(target) ? target : [target])
  assertTargets(uris)
  return { uris }
}

// const assertInteractionTargets = (target: Target) => {

// }

/**
 * Checks if the URN is for an interaction.
 * @param uri the device URN.
 */
const isInteractionUri = (uri: string) => {
  !!uri?.startsWith(INTERACTION_ROOT) && ((uri?.split(`:`).length - 1) >= 3)
}

/**
 * Checks if the URN is a Relay URN.
 * @param uri the device, group, or interaction URN.
 * @returns true if the URN is a Relay URN, false otherwise.
 */
const isRelayUri = (uri: string) => {
  return !!uri?.startsWith(`urn:${ROOT}`) && ((uri?.split(`:`).length - 1) >= 3)
}

export {
  isInteractionUri,
  isRelayUri,
  assertTargets,
  makeTargetUris,
  parseDeviceName,
  parseDeviceId,
  parseGroupName,
  parseGroupId,
  groupId,
  groupName,
  groupMember,
  deviceId,
  deviceName,
  allDevicesWithStatus,
  allDevices,
  genericOriginator,
}
