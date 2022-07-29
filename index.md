<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [relay-js](#relay-js)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
  - [Workflow Registration](#workflow-registration)
  - [Development](#development)
  - [License](#license)
- [Classes](#classes)
  - [Class: default](#class-default)
    - [Table of contents](#table-of-contents)
    - [Methods](#methods)
  - [Class: Workflow](#class-workflow)
    - [Table of contents](#table-of-contents-1)
    - [Methods](#methods-1)
- [Enums](#enums)
  - [Enumeration: Button](#enumeration-button)
    - [Table of contents](#table-of-contents-2)
    - [Enumeration Members](#enumeration-members)
  - [Enumeration: CallDirection](#enumeration-calldirection)
    - [Table of contents](#table-of-contents-3)
    - [Enumeration Members](#enumeration-members-1)
  - [Enumeration: DeviceInfoField](#enumeration-deviceinfofield)
    - [Table of contents](#table-of-contents-4)
    - [Enumeration Members](#enumeration-members-2)
  - [Enumeration: DeviceInfoQuery](#enumeration-deviceinfoquery)
    - [Table of contents](#table-of-contents-5)
    - [Enumeration Members](#enumeration-members-3)
  - [Enumeration: DeviceType](#enumeration-devicetype)
    - [Table of contents](#table-of-contents-6)
    - [Enumeration Members](#enumeration-members-4)
  - [Enumeration: Event](#enumeration-event)
    - [Table of contents](#table-of-contents-7)
    - [Enumeration Members](#enumeration-members-5)
  - [Enumeration: IncidentStatus](#enumeration-incidentstatus)
    - [Table of contents](#table-of-contents-8)
    - [Enumeration Members](#enumeration-members-6)
  - [Enumeration: Language](#enumeration-language)
    - [Table of contents](#table-of-contents-9)
    - [Enumeration Members](#enumeration-members-7)
  - [Enumeration: Notification](#enumeration-notification)
    - [Table of contents](#table-of-contents-10)
    - [Enumeration Members](#enumeration-members-8)
  - [Enumeration: NotificationPriority](#enumeration-notificationpriority)
    - [Table of contents](#table-of-contents-11)
    - [Enumeration Members](#enumeration-members-9)
  - [Enumeration: NotificationSound](#enumeration-notificationsound)
    - [Table of contents](#table-of-contents-12)
    - [Enumeration Members](#enumeration-members-10)
  - [Enumeration: Taps](#enumeration-taps)
    - [Table of contents](#table-of-contents-13)
    - [Enumeration Members](#enumeration-members-11)
  - [Enumeration: TimeoutType](#enumeration-timeouttype)
    - [Table of contents](#table-of-contents-14)
    - [Enumeration Members](#enumeration-members-12)
  - [Enumeration: TimerType](#enumeration-timertype)
    - [Table of contents](#table-of-contents-15)
    - [Enumeration Members](#enumeration-members-13)
- [Interfaces](#interfaces)
  - [Interface: Relay](#interface-relay)
    - [Table of contents](#table-of-contents-16)
    - [Properties](#properties)
    - [Methods](#methods-2)
  - [Interface: WorkflowEventHandler](#interface-workfloweventhandler)
    - [Callable](#callable)
- [@relaypro/sdk](#relayprosdk)
  - [Table of contents](#table-of-contents-17)
    - [Modules](#modules)
- [Modules](#modules-1)
  - [Module: api](#module-api)
    - [Table of contents](#table-of-contents-18)
  - [Module: constants](#module-constants)
    - [Table of contents](#table-of-contents-19)
    - [Variables](#variables)
  - [Module: enums](#module-enums)
    - [Table of contents](#table-of-contents-20)
  - [Module: index](#module-index)
    - [Table of contents](#table-of-contents-21)
    - [References](#references)
    - [Variables](#variables-1)
    - [Functions](#functions)
  - [Module: queue](#module-queue)
  - [Module: types](#module-types)
    - [Table of contents](#table-of-contents-22)
    - [Type Aliases](#type-aliases)
  - [Module: uri](#module-uri)
    - [Table of contents](#table-of-contents-23)
    - [Functions](#functions-1)
  - [Module: utils](#module-utils)
    - [Table of contents](#table-of-contents-24)
    - [Functions](#functions-2)
  - [Module: vars](#module-vars)
    - [Table of contents](#table-of-contents-25)
    - [Variables](#variables-2)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


<a name="readmemd"></a>

@relaypro/sdk / [Exports](#modulesmd)

# relay-js

relay-js SDK is a Node.js library for interacting with Relay. For full documentation visit [developer.relaypro.com](https://developer.relaypro.com).

## Installation

```bash
npm install @relaypro/sdk
```

## Usage

The following code snippet demonstrates a very simple "Hello World" workflow. However, it does show some of the power that is available through the Relay SDK.

```javascript
import pkg from '@relaypro/sdk'
const { relay, Event, createWorkflow, Uri } = pkg

const app = relay()

app.workflow(`helloworld`, helloworld)

const helloworld = createWorkflow(wf => {
  wf.on(Event.START, async (event) => {
    const { trigger: { args: { source_uri } } } = event
    wf.startInteraction([source_uri], `hello world`)
  })

  wf.on(Event.INTERACTION_STARTED, async ({ source_uri }) => {
    const deviceName = Uri.parseDeviceName(source_uri)
    console.log(`interaction start ${source_uri}`)
    await wf.sayAndWait(source_uri, `What is your name ?`)
    const { text: userProvidedName } = await wf.listen(source_uri)
    const greeting = await wf.getVar(`greeting`)
    await wf.sayAndWait(source_uri, `${greeting} ${userProvidedName}! You are currently using ${deviceName}`)
    await wf.terminate()
  })
})
```

Features demonstrated here:

* When the workflow is triggered, the `start` event is emitted and the registered start callback
  function is called.
* An __interaction__ is started. This creates a temporary channel on the Relay device, which provides
  a sort of "context" in which some device-specific commands are sent.
* Inside the __interaction started__ handler, the workflow prompts with the `sayAndWait` action. The device user will hear text-to-speech.
* The workflow awaits for a response from the device user with the `listen` action.
* A workflow configuration variable `greeting` is retrieved as is the triggering device's name.
* The workflow then again uses text-to-speech to reply with a dynamic message.
* Finally, the workflow is terminated and the device is returned to its original state.

Using the Relay CLI, the workflow can be registered with the following command:

```bash
relay workflow:create:phrase --name my-test-workflow --uri wss://yourhost:port/helloworld --trigger test -i 99000XXXXXXXXXX
```

In the above sample sample, a workflow callback function is registered with the name `helloworld`. This value
of `helloworld` is used to map a WebSocket connection at the path `wss://yourhost:port/helloworld`
to the registered workflow callback function.

It is also possible to register a "default" workflow at path `/` by providing the workflow callback
function as the first parameter:

```javascript
app.workflow(wf => {
  wf.on(Event.START, async () => {
    // handle start event
  })
})
```

## API

The Relay JS SDK covers a broad set of use cases. Explore the various actions that can be performed
in workflow event callbacks:

* [Workflow](https://relaypro.github.io/relay-js/#class-workflow)

The full API reference is available at https://relaypro.github.io/relay-js .

## Workflow Registration

More thorough documentation on how to register your workflow on a Relay device
can be found at [https://developer.relaypro.com/docs/register-workflows](https://developer.relaypro.com/docs/register-workflows)

## Development

```bash
git clone git@github.com:relaypro/relay-js.git
cd relay-js
npm install
npm run build
npm run test
```

## License
[MIT](https://choosealicense.com/licenses/mit/)

# Classes


<a name="classesapidefaultmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [api](#modulesapimd) / default

## Class: default

[api](#modulesapimd).default

### Table of contents

#### Methods

- [fetchDevice](#fetchdevice)
- [triggerWorkflow](#triggerworkflow)

### Methods

#### fetchDevice

▸ **fetchDevice**(`id`): `Promise`<[`Device`](#device)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

##### Returns

`Promise`<[`Device`](#device)\>

##### Defined in

[api.ts:170](https://github.com/relaypro/relay-js/blob/b16ef5f/src/api.ts#L170)

___

#### triggerWorkflow

▸ **triggerWorkflow**(`id`, `targets`, `args?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `targets` | [`Target`](#target) |
| `args?` | `Record`<`string`, `string`\> |

##### Returns

`Promise`<`void`\>

##### Defined in

[api.ts:176](https://github.com/relaypro/relay-js/blob/b16ef5f/src/api.ts#L176)


<a name="classesindexworkflowmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [index](#modulesindexmd) / Workflow

## Class: Workflow

[index](#modulesindexmd).Workflow

### Table of contents

#### Methods

- [alert](#alert)
- [answerCall](#answercall)
- [breathe](#breathe)
- [broadcast](#broadcast)
- [cancelAlert](#cancelalert)
- [cancelBroadcast](#cancelbroadcast)
- [cancelNotify](#cancelnotify)
- [clearTimer](#cleartimer)
- [createIncident](#createincident)
- [disableHomeChannel](#disablehomechannel)
- [disableLocation](#disablelocation)
- [enableHomeChannel](#enablehomechannel)
- [enableLocation](#enablelocation)
- [endInteraction](#endinteraction)
- [flash](#flash)
- [get](#get)
- [getArrayVar](#getarrayvar)
- [getDeviceAddress](#getdeviceaddress)
- [getDeviceBattery](#getdevicebattery)
- [getDeviceCoordinates](#getdevicecoordinates)
- [getDeviceId](#getdeviceid)
- [getDeviceIndoorLocation](#getdeviceindoorlocation)
- [getDeviceLatLong](#getdevicelatlong)
- [getDeviceLocation](#getdevicelocation)
- [getDeviceLocationEnabled](#getdevicelocationenabled)
- [getDeviceName](#getdevicename)
- [getDeviceType](#getdevicetype)
- [getGroupMembers](#getgroupmembers)
- [getMappedVar](#getmappedvar)
- [getNumberArrayVar](#getnumberarrayvar)
- [getNumberVar](#getnumbervar)
- [getUnreadInboxSize](#getunreadinboxsize)
- [getUserProfile](#getuserprofile)
- [getVar](#getvar)
- [hangupCall](#hangupcall)
- [isGroupMember](#isgroupmember)
- [ledAction](#ledaction)
- [listen](#listen)
- [logMessage](#logmessage)
- [logUserMessage](#logusermessage)
- [notify](#notify)
- [off](#off)
- [on](#on)
- [placeCall](#placecall)
- [play](#play)
- [playAndWait](#playandwait)
- [playUnreadInboxMessages](#playunreadinboxmessages)
- [powerDownDevice](#powerdowndevice)
- [rainbow](#rainbow)
- [registerForCalls](#registerforcalls)
- [resolveIncident](#resolveincident)
- [restartDevice](#restartdevice)
- [rotate](#rotate)
- [say](#say)
- [sayAndWait](#sayandwait)
- [set](#set)
- [setChannel](#setchannel)
- [setDefaultAnalyticEventParameters](#setdefaultanalyticeventparameters)
- [setDeviceChannel](#setdevicechannel)
- [setDeviceMode](#setdevicemode)
- [setDeviceName](#setdevicename)
- [setTimer](#settimer)
- [setUserProfile](#setuserprofile)
- [setVar](#setvar)
- [startInteraction](#startinteraction)
- [startTimer](#starttimer)
- [stopTimer](#stoptimer)
- [switchAllLedOff](#switchallledoff)
- [switchAllLedOn](#switchallledon)
- [switchLedOn](#switchledon)
- [terminate](#terminate)
- [trackEvent](#trackevent)
- [trackUserEvent](#trackuserevent)
- [translate](#translate)
- [unregisterForCalls](#unregisterforcalls)
- [unset](#unset)
- [unsetVar](#unsetvar)
- [vibrate](#vibrate)

### Methods

#### alert

▸ **alert**(`target`, `originator`, `name`, `text`, `pushOptions?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `originator` | `string` |
| `name` | `string` |
| `text` | `string` |
| `pushOptions?` | [`NotificationOptions`](#notificationoptions) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:417](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L417)

___

#### answerCall

▸ **answerCall**(`target`, `callRequest`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `callRequest` | `string` \| [`BaseCallEvent`](#basecallevent) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:562](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L562)

___

#### breathe

▸ **breathe**(`target`, `color?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `color` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:377](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L377)

___

#### broadcast

▸ **broadcast**(`target`, `originator`, `name`, `text`, `pushOptions?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `originator` | `string` |
| `name` | `string` |
| `text` | `string` |
| `pushOptions?` | [`NotificationOptions`](#notificationoptions) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:401](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L401)

___

#### cancelAlert

▸ **cancelAlert**(`target`, `name`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `name` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:421](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L421)

___

#### cancelBroadcast

▸ **cancelBroadcast**(`target`, `name`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `name` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:405](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L405)

___

#### cancelNotify

▸ **cancelNotify**(`target`, `name`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `name` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:413](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L413)

___

#### clearTimer

▸ **clearTimer**(`name`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:600](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L600)

___

#### createIncident

▸ **createIncident**(`originatorUri`, `type`): `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `originatorUri` | `string` |
| `type` | `string` |

##### Returns

`Promise`<`string`\>

##### Defined in

[index.ts:749](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L749)

___

#### disableHomeChannel

▸ **disableHomeChannel**(`target`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:389](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L389)

___

#### disableLocation

▸ **disableLocation**(`target`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:512](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L512)

___

#### enableHomeChannel

▸ **enableHomeChannel**(`target`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:385](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L385)

___

#### enableLocation

▸ **enableLocation**(`target`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:508](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L508)

___

#### endInteraction

▸ **endInteraction**(`target`, `name`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `name` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:313](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L313)

___

#### flash

▸ **flash**(`target`, `color?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `color` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:373](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L373)

___

#### get

▸ **get**(`names`, `mappers`): `Promise`<[`AnyPrimitive`](#anyprimitive) \| [`AnyPrimitive`](#anyprimitive)[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `names` | `string` \| `string`[] |
| `mappers` | [[`Mapper`](#mapper)<[`AnyPrimitive`](#anyprimitive)\>] |

##### Returns

`Promise`<[`AnyPrimitive`](#anyprimitive) \| [`AnyPrimitive`](#anyprimitive)[]\>

##### Defined in

[index.ts:723](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L723)

___

#### getArrayVar

▸ **getArrayVar**(`name`, `defaultValue?`): `Promise`<`undefined` \| `string`[]\>

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `undefined` |
| `defaultValue` | `undefined` | `undefined` |

##### Returns

`Promise`<`undefined` \| `string`[]\>

##### Defined in

[index.ts:715](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L715)

___

#### getDeviceAddress

▸ **getDeviceAddress**(`target`, `refresh`): `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `refresh` | `boolean` |

##### Returns

`Promise`<`string`\>

##### Defined in

[index.ts:470](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L470)

___

#### getDeviceBattery

▸ **getDeviceBattery**(`target`, `refresh`): `Promise`<`number`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `refresh` | `boolean` |

##### Returns

`Promise`<`number`\>

##### Defined in

[index.ts:486](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L486)

___

#### getDeviceCoordinates

▸ **getDeviceCoordinates**(`target`, `refresh`): `Promise`<`number`[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `refresh` | `boolean` |

##### Returns

`Promise`<`number`[]\>

##### Defined in

[index.ts:474](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L474)

___

#### getDeviceId

▸ **getDeviceId**(`target`): `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |

##### Returns

`Promise`<`string`\>

##### Defined in

[index.ts:458](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L458)

___

#### getDeviceIndoorLocation

▸ **getDeviceIndoorLocation**(`target`, `refresh`): `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `refresh` | `boolean` |

##### Returns

`Promise`<`string`\>

##### Defined in

[index.ts:482](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L482)

___

#### getDeviceLatLong

▸ **getDeviceLatLong**(`target`, `refresh`): `Promise`<`number`[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `refresh` | `boolean` |

##### Returns

`Promise`<`number`[]\>

##### Defined in

[index.ts:478](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L478)

___

#### getDeviceLocation

▸ **getDeviceLocation**(`target`, `refresh`): `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `refresh` | `boolean` |

##### Returns

`Promise`<`string`\>

##### Defined in

[index.ts:462](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L462)

___

#### getDeviceLocationEnabled

▸ **getDeviceLocationEnabled**(`target`): `Promise`<`boolean`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |

##### Returns

`Promise`<`boolean`\>

##### Defined in

[index.ts:466](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L466)

___

#### getDeviceName

▸ **getDeviceName**(`target`): `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |

##### Returns

`Promise`<`string`\>

##### Defined in

[index.ts:453](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L453)

___

#### getDeviceType

▸ **getDeviceType**(`target`): `Promise`<[`DeviceType`](#enumsenumsdevicetypemd)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |

##### Returns

`Promise`<[`DeviceType`](#enumsenumsdevicetypemd)\>

##### Defined in

[index.ts:490](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L490)

___

#### getGroupMembers

▸ **getGroupMembers**(`groupUri`): `Promise`<`string`[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `groupUri` | `string` |

##### Returns

`Promise`<`string`[]\>

##### Defined in

[index.ts:609](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L609)

___

#### getMappedVar

▸ **getMappedVar**<`Type`\>(`name`, `mapper`, `defaultValue?`): `Promise`<`undefined` \| `Type`\>

##### Type parameters

| Name |
| :------ |
| `Type` |

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `undefined` |
| `mapper` | [`Mapper`](#mapper)<`Type`\> | `undefined` |
| `defaultValue` | `undefined` | `undefined` |

##### Returns

`Promise`<`undefined` \| `Type`\>

##### Defined in

[index.ts:703](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L703)

___

#### getNumberArrayVar

▸ **getNumberArrayVar**(`name`, `defaultValue?`): `Promise`<`undefined` \| `number`[]\>

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `undefined` |
| `defaultValue` | `undefined` | `undefined` |

##### Returns

`Promise`<`undefined` \| `number`[]\>

##### Defined in

[index.ts:719](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L719)

___

#### getNumberVar

▸ **getNumberVar**(`name`, `defaultValue?`): `Promise`<`undefined` \| `number`\>

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `undefined` |
| `defaultValue` | `undefined` | `undefined` |

##### Returns

`Promise`<`undefined` \| `number`\>

##### Defined in

[index.ts:711](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L711)

___

#### getUnreadInboxSize

▸ **getUnreadInboxSize**(`target`): `Promise`<`number`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |

##### Returns

`Promise`<`number`\>

##### Defined in

[index.ts:578](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L578)

___

#### getUserProfile

▸ **getUserProfile**(`target`): `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |

##### Returns

`Promise`<`string`\>

##### Defined in

[index.ts:443](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L443)

___

#### getVar

▸ **getVar**(`name`, `defaultValue?`): `Promise`<`undefined` \| `string`\>

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `undefined` |
| `defaultValue` | `undefined` | `undefined` |

##### Returns

`Promise`<`undefined` \| `string`\>

##### Defined in

[index.ts:694](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L694)

___

#### hangupCall

▸ **hangupCall**(`target`, `callRequest`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `callRequest` | `string` \| [`BaseCallEvent`](#basecallevent) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:566](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L566)

___

#### isGroupMember

▸ **isGroupMember**(`groupNameUri`, `potentialMemberNameUri`): `Promise`<`boolean`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `groupNameUri` | `string` |
| `potentialMemberNameUri` | `string` |

##### Returns

`Promise`<`boolean`\>

##### Defined in

[index.ts:614](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L614)

___

#### ledAction

▸ **ledAction**(`target`, `effect`, `args`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `effect` | [`LedEffect`](#ledeffect) |
| `args` | [`LedInfo`](#ledinfo) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:381](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L381)

___

#### listen

▸ **listen**(`target`, `phrases?`, `__namedParameters?`): `Promise`<[`ListenResponse`](#listenresponse)\>

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `target` | `string` | `undefined` |
| `phrases` | `never`[] | `[]` |
| `__namedParameters` | `Object` | `{}` |
| `__namedParameters.alt_lang` | `undefined` \| [`Language`](#enumsenumslanguagemd) | `undefined` |
| `__namedParameters.timeout` | `undefined` \| `number` | `undefined` |
| `__namedParameters.transcribe` | `undefined` \| `boolean` | `undefined` |

##### Returns

`Promise`<[`ListenResponse`](#listenresponse)\>

##### Defined in

[index.ts:524](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L524)

___

#### logMessage

▸ **logMessage**(`message`, `category?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `category` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:627](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L627)

___

#### logUserMessage

▸ **logUserMessage**(`message`, `target`, `category?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `target` | `string` |
| `category` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:635](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L635)

___

#### notify

▸ **notify**(`target`, `originator`, `name`, `text`, `pushOptions?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `originator` | `string` |
| `name` | `string` |
| `text` | `string` |
| `pushOptions?` | [`NotificationOptions`](#notificationoptions) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:409](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L409)

___

#### off

▸ **off**<`U`\>(`eventName`): `void`

##### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends keyof `WorkflowEventMappings` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `U` |

##### Returns

`void`

##### Defined in

[index.ts:90](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L90)

___

#### on

▸ **on**<`U`\>(`eventName`, `listener`): `void`

##### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends keyof `WorkflowEventMappings` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `eventName` | `U` |
| `listener` | [`WorkflowEventHandlers`](#workfloweventhandlers)[`U`] |

##### Returns

`void`

##### Defined in

[index.ts:85](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L85)

___

#### placeCall

▸ **placeCall**(`target`, `call`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `call` | `Partial`<`Omit`<[`StartedCallEvent`](#startedcallevent), ``"call_id"``\>\> |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:558](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L558)

___

#### play

▸ **play**(`target`, `filename`): `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `filename` | `string` |

##### Returns

`Promise`<`string`\>

##### Defined in

[index.ts:328](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L328)

___

#### playAndWait

▸ **playAndWait**(`target`, `filename`): `Promise`<`string`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `filename` | `string` |

##### Returns

`Promise`<`string`\>

##### Defined in

[index.ts:333](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L333)

___

#### playUnreadInboxMessages

▸ **playUnreadInboxMessages**(`target`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:583](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L583)

___

#### powerDownDevice

▸ **powerDownDevice**(`target`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:429](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L429)

___

#### rainbow

▸ **rainbow**(`target`, `rotations?`): `Promise`<`void`\>

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | `undefined` |
| `rotations` | `number` | `-1` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:365](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L365)

___

#### registerForCalls

▸ **registerForCalls**(`target`, `request`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `request` | [`RegisterRequest`](#registerrequest) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:570](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L570)

___

#### resolveIncident

▸ **resolveIncident**(`incidentId`, `reason`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `incidentId` | `string` |
| `reason` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:754](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L754)

___

#### restartDevice

▸ **restartDevice**(`target`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:425](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L425)

___

#### rotate

▸ **rotate**(`target`, `color?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `color` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:369](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L369)

___

#### say

▸ **say**(`target`, `text`, `lang?`): `Promise`<`string`\>

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | `undefined` |
| `text` | `string` | `undefined` |
| `lang` | [`Language`](#enumsenumslanguagemd) | `Language.ENGLISH` |

##### Returns

`Promise`<`string`\>

##### Defined in

[index.ts:317](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L317)

___

#### sayAndWait

▸ **sayAndWait**(`target`, `text`, `lang?`): `Promise`<`string`\>

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | `undefined` |
| `text` | `string` | `undefined` |
| `lang` | [`Language`](#enumsenumslanguagemd) | `Language.ENGLISH` |

##### Returns

`Promise`<`string`\>

##### Defined in

[index.ts:322](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L322)

___

#### set

▸ **set**(`obj`, `value?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `Record`<`string`, `string`\> |
| `value?` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:671](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L671)

___

#### setChannel

▸ **setChannel**(`target`, `name`, `__namedParameters?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `name` | `string` |
| `__namedParameters` | `Object` |
| `__namedParameters.disableHomeChannel?` | ``false`` |
| `__namedParameters.suppressTTS?` | `boolean` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:520](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L520)

___

#### setDefaultAnalyticEventParameters

▸ **setDefaultAnalyticEventParameters**(`params`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Record`<`string`, `string` \| `number` \| `boolean`\> |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:623](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L623)

___

#### setDeviceChannel

▸ **setDeviceChannel**(`target`, `channel`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `channel` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:503](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L503)

___

#### setDeviceMode

▸ **setDeviceMode**(`target`, `mode`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `mode` | ``"panic"`` \| ``"alarm"`` \| ``"none"`` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:516](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L516)

___

#### setDeviceName

▸ **setDeviceName**(`target`, `name`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `name` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:498](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L498)

___

#### setTimer

▸ **setTimer**(`type`, `name`, `timeout?`, `timeout_type`): `Promise`<`void`\>

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `type` | [`TimerType`](#enumsenumstimertypemd) | `undefined` |
| `name` | `string` | `undefined` |
| `timeout` | `number` | `60` |
| `timeout_type` | [`TimeoutType`](#enumsenumstimeouttypemd) | `undefined` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:596](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L596)

___

#### setUserProfile

▸ **setUserProfile**(`target`, `username`, `force?`): `Promise`<`void`\>

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `target` | `string` | `undefined` |
| `username` | `string` | `undefined` |
| `force` | `boolean` | `false` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:448](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L448)

___

#### setVar

▸ **setVar**(`name`, `value`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `value` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:667](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L667)

___

#### startInteraction

▸ **startInteraction**(`target`, `name`, `options`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `name` | `string` |
| `options` | [`InteractionOptions`](#interactionoptions) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:309](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L309)

___

#### startTimer

▸ **startTimer**(`timeout?`): `Promise`<`void`\>

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `timeout` | `number` | `60` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:741](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L741)

___

#### stopTimer

▸ **stopTimer**(): `Promise`<`void`\>

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:745](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L745)

___

#### switchAllLedOff

▸ **switchAllLedOff**(`target`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:361](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L361)

___

#### switchAllLedOn

▸ **switchAllLedOn**(`target`, `color`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `color` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:357](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L357)

___

#### switchLedOn

▸ **switchLedOn**(`target`, `led`, `color`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `led` | [`LedIndex`](#ledindex) |
| `color` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:353](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L353)

___

#### terminate

▸ **terminate**(): `Promise`<`void`\>

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:758](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L758)

___

#### trackEvent

▸ **trackEvent**(`category`, `parameters?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `category` | `string` |
| `parameters?` | [`TrackEventParameters`](#trackeventparameters) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:644](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L644)

___

#### trackUserEvent

▸ **trackUserEvent**(`category`, `target`, `parameters?`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `category` | `string` |
| `target` | `string` |
| `parameters?` | [`TrackEventParameters`](#trackeventparameters) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:655](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L655)

___

#### translate

▸ **translate**(`text`, `from?`, `to?`): `Promise`<`string`\>

##### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `text` | `string` | `undefined` |
| `from` | [`Language`](#enumsenumslanguagemd) | `Language.ENGLISH` |
| `to` | [`Language`](#enumsenumslanguagemd) | `Language.SPANISH` |

##### Returns

`Promise`<`string`\>

##### Defined in

[index.ts:604](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L604)

___

#### unregisterForCalls

▸ **unregisterForCalls**(`target`, `request`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `string` |
| `request` | [`UnregisterRequest`](#unregisterrequest) |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:574](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L574)

___

#### unset

▸ **unset**(`names`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `names` | `string` \| `string`[] |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:686](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L686)

___

#### unsetVar

▸ **unsetVar**(`name`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:682](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L682)

___

#### vibrate

▸ **vibrate**(`target`, `pattern`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |
| `pattern` | `number`[] |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:349](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L349)

# Enums


<a name="enumsenumsbuttonmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Button

## Enumeration: Button

[enums](#modulesenumsmd).Button

### Table of contents

#### Enumeration Members

- [ACTION](#action)
- [CHANNEL](#channel)

### Enumeration Members

#### ACTION

• **ACTION**

##### Defined in

[enums.ts:33](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L33)

___

#### CHANNEL

• **CHANNEL**

##### Defined in

[enums.ts:34](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L34)


<a name="enumsenumscalldirectionmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / CallDirection

## Enumeration: CallDirection

[enums](#modulesenumsmd).CallDirection

### Table of contents

#### Enumeration Members

- [INBOUND](#inbound)
- [OUTBOUND](#outbound)

### Enumeration Members

#### INBOUND

• **INBOUND**

##### Defined in

[enums.ts:28](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L28)

___

#### OUTBOUND

• **OUTBOUND**

##### Defined in

[enums.ts:29](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L29)


<a name="enumsenumsdeviceinfofieldmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / DeviceInfoField

## Enumeration: DeviceInfoField

[enums](#modulesenumsmd).DeviceInfoField

### Table of contents

#### Enumeration Members

- [CHANNEL](#channel)
- [LABEL](#label)
- [LOCATION\_ENABLED](#location_enabled)

### Enumeration Members

#### CHANNEL

• **CHANNEL**

##### Defined in

[enums.ts:97](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L97)

___

#### LABEL

• **LABEL**

##### Defined in

[enums.ts:96](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L96)

___

#### LOCATION\_ENABLED

• **LOCATION\_ENABLED**

##### Defined in

[enums.ts:98](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L98)


<a name="enumsenumsdeviceinfoquerymd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / DeviceInfoQuery

## Enumeration: DeviceInfoQuery

[enums](#modulesenumsmd).DeviceInfoQuery

### Table of contents

#### Enumeration Members

- [ADDRESS](#address)
- [BATTERY](#battery)
- [COORDINATES](#coordinates)
- [ID](#id)
- [INDOOR\_LOCATION](#indoor_location)
- [LOCATION](#location)
- [LOCATION\_ENABLED](#location_enabled)
- [NAME](#name)
- [TYPE](#type)
- [USERNAME](#username)

### Enumeration Members

#### ADDRESS

• **ADDRESS**

##### Defined in

[enums.ts:86](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L86)

___

#### BATTERY

• **BATTERY**

##### Defined in

[enums.ts:88](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L88)

___

#### COORDINATES

• **COORDINATES**

##### Defined in

[enums.ts:87](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L87)

___

#### ID

• **ID**

##### Defined in

[enums.ts:84](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L84)

___

#### INDOOR\_LOCATION

• **INDOOR\_LOCATION**

##### Defined in

[enums.ts:89](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L89)

___

#### LOCATION

• **LOCATION**

##### Defined in

[enums.ts:90](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L90)

___

#### LOCATION\_ENABLED

• **LOCATION\_ENABLED**

##### Defined in

[enums.ts:92](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L92)

___

#### NAME

• **NAME**

##### Defined in

[enums.ts:83](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L83)

___

#### TYPE

• **TYPE**

##### Defined in

[enums.ts:85](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L85)

___

#### USERNAME

• **USERNAME**

##### Defined in

[enums.ts:91](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L91)


<a name="enumsenumsdevicetypemd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / DeviceType

## Enumeration: DeviceType

[enums](#modulesenumsmd).DeviceType

### Table of contents

#### Enumeration Members

- [DASH](#dash)
- [RELAY](#relay)
- [RELAY2](#relay2)
- [RELAY\_APP](#relay_app)
- [ROIP](#roip)

### Enumeration Members

#### DASH

• **DASH**

##### Defined in

[enums.ts:106](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L106)

___

#### RELAY

• **RELAY**

##### Defined in

[enums.ts:102](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L102)

___

#### RELAY2

• **RELAY2**

##### Defined in

[enums.ts:103](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L103)

___

#### RELAY\_APP

• **RELAY\_APP**

##### Defined in

[enums.ts:104](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L104)

___

#### ROIP

• **ROIP**

##### Defined in

[enums.ts:105](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L105)


<a name="enumsenumseventmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Event

## Enumeration: Event

[enums](#modulesenumsmd).Event

### Table of contents

#### Enumeration Members

- [BUTTON](#button)
- [CALL\_CONNECTED](#call_connected)
- [CALL\_DISCONNECTED](#call_disconnected)
- [CALL\_FAILED](#call_failed)
- [CALL\_RECEIVED](#call_received)
- [CALL\_RINGING](#call_ringing)
- [CALL\_START\_REQUEST](#call_start_request)
- [ERROR](#error)
- [INCIDENT](#incident)
- [INTERACTION\_ENDED](#interaction_ended)
- [INTERACTION\_FAILED](#interaction_failed)
- [INTERACTION\_LIFECYCLE](#interaction_lifecycle)
- [INTERACTION\_RESUMED](#interaction_resumed)
- [INTERACTION\_STARTED](#interaction_started)
- [INTERACTION\_SUSPENDED](#interaction_suspended)
- [NOTIFICATION](#notification)
- [PROMPT](#prompt)
- [SPEECH](#speech)
- [START](#start)
- [STOP](#stop)
- [TIMER](#timer)

### Enumeration Members

#### BUTTON

• **BUTTON**

##### Defined in

[enums.ts:13](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L13)

___

#### CALL\_CONNECTED

• **CALL\_CONNECTED**

##### Defined in

[enums.ts:20](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L20)

___

#### CALL\_DISCONNECTED

• **CALL\_DISCONNECTED**

##### Defined in

[enums.ts:21](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L21)

___

#### CALL\_FAILED

• **CALL\_FAILED**

##### Defined in

[enums.ts:22](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L22)

___

#### CALL\_RECEIVED

• **CALL\_RECEIVED**

##### Defined in

[enums.ts:23](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L23)

___

#### CALL\_RINGING

• **CALL\_RINGING**

##### Defined in

[enums.ts:19](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L19)

___

#### CALL\_START\_REQUEST

• **CALL\_START\_REQUEST**

##### Defined in

[enums.ts:24](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L24)

___

#### ERROR

• **ERROR**

##### Defined in

[enums.ts:4](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L4)

___

#### INCIDENT

• **INCIDENT**

##### Defined in

[enums.ts:16](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L16)

___

#### INTERACTION\_ENDED

• **INTERACTION\_ENDED**

##### Defined in

[enums.ts:11](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L11)

___

#### INTERACTION\_FAILED

• **INTERACTION\_FAILED**

##### Defined in

[enums.ts:12](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L12)

___

#### INTERACTION\_LIFECYCLE

• **INTERACTION\_LIFECYCLE**

##### Defined in

[enums.ts:7](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L7)

___

#### INTERACTION\_RESUMED

• **INTERACTION\_RESUMED**

##### Defined in

[enums.ts:9](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L9)

___

#### INTERACTION\_STARTED

• **INTERACTION\_STARTED**

##### Defined in

[enums.ts:8](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L8)

___

#### INTERACTION\_SUSPENDED

• **INTERACTION\_SUSPENDED**

##### Defined in

[enums.ts:10](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L10)

___

#### NOTIFICATION

• **NOTIFICATION**

##### Defined in

[enums.ts:15](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L15)

___

#### PROMPT

• **PROMPT**

##### Defined in

[enums.ts:17](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L17)

___

#### SPEECH

• **SPEECH**

##### Defined in

[enums.ts:18](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L18)

___

#### START

• **START**

##### Defined in

[enums.ts:5](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L5)

___

#### STOP

• **STOP**

##### Defined in

[enums.ts:6](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L6)

___

#### TIMER

• **TIMER**

##### Defined in

[enums.ts:14](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L14)


<a name="enumsenumsincidentstatusmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / IncidentStatus

## Enumeration: IncidentStatus

[enums](#modulesenumsmd).IncidentStatus

### Table of contents

#### Enumeration Members

- [CANCELLED](#cancelled)
- [RESOLVED](#resolved)

### Enumeration Members

#### CANCELLED

• **CANCELLED**

##### Defined in

[enums.ts:118](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L118)

___

#### RESOLVED

• **RESOLVED**

##### Defined in

[enums.ts:117](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L117)


<a name="enumsenumslanguagemd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Language

## Enumeration: Language

[enums](#modulesenumsmd).Language

### Table of contents

#### Enumeration Members

- [ARABIC](#arabic)
- [BENGALI](#bengali)
- [CHINESE](#chinese)
- [CZECH](#czech)
- [DANISH](#danish)
- [DUTCH](#dutch)
- [ENGLISH](#english)
- [FILIPINO](#filipino)
- [FINNISH](#finnish)
- [FRENCH](#french)
- [GERMAN](#german)
- [GREEK](#greek)
- [GUJURATI](#gujurati)
- [HINDI](#hindi)
- [HUNGARIAN](#hungarian)
- [ICELANDIC](#icelandic)
- [INDONESIAN](#indonesian)
- [ITALIAN](#italian)
- [JAPANESE](#japanese)
- [KANNADA](#kannada)
- [KOREAN](#korean)
- [MALAY](#malay)
- [NORWEGIAN](#norwegian)
- [POLISH](#polish)
- [PORTUGUESE](#portuguese)
- [PUNJABI](#punjabi)
- [ROMANIAN](#romanian)
- [RUSSIAN](#russian)
- [SLOVAK](#slovak)
- [SPANISH](#spanish)
- [SWEDISH](#swedish)
- [TAMIL](#tamil)
- [TURKISH](#turkish)
- [UKRANIAN](#ukranian)
- [VIETNAMESE](#vietnamese)

### Enumeration Members

#### ARABIC

• **ARABIC**

##### Defined in

[enums.ts:62](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L62)

___

#### BENGALI

• **BENGALI**

##### Defined in

[enums.ts:76](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L76)

___

#### CHINESE

• **CHINESE**

##### Defined in

[enums.ts:61](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L61)

___

#### CZECH

• **CZECH**

##### Defined in

[enums.ts:67](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L67)

___

#### DANISH

• **DANISH**

##### Defined in

[enums.ts:66](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L66)

___

#### DUTCH

• **DUTCH**

##### Defined in

[enums.ts:60](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L60)

___

#### ENGLISH

• **ENGLISH**

##### Defined in

[enums.ts:45](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L45)

___

#### FILIPINO

• **FILIPINO**

##### Defined in

[enums.ts:65](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L65)

___

#### FINNISH

• **FINNISH**

##### Defined in

[enums.ts:79](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L79)

___

#### FRENCH

• **FRENCH**

##### Defined in

[enums.ts:48](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L48)

___

#### GERMAN

• **GERMAN**

##### Defined in

[enums.ts:46](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L46)

___

#### GREEK

• **GREEK**

##### Defined in

[enums.ts:77](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L77)

___

#### GUJURATI

• **GUJURATI**

##### Defined in

[enums.ts:68](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L68)

___

#### HINDI

• **HINDI**

##### Defined in

[enums.ts:53](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L53)

___

#### HUNGARIAN

• **HUNGARIAN**

##### Defined in

[enums.ts:69](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L69)

___

#### ICELANDIC

• **ICELANDIC**

##### Defined in

[enums.ts:54](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L54)

___

#### INDONESIAN

• **INDONESIAN**

##### Defined in

[enums.ts:64](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L64)

___

#### ITALIAN

• **ITALIAN**

##### Defined in

[enums.ts:49](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L49)

___

#### JAPANESE

• **JAPANESE**

##### Defined in

[enums.ts:55](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L55)

___

#### KANNADA

• **KANNADA**

##### Defined in

[enums.ts:78](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L78)

___

#### KOREAN

• **KOREAN**

##### Defined in

[enums.ts:56](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L56)

___

#### MALAY

• **MALAY**

##### Defined in

[enums.ts:75](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L75)

___

#### NORWEGIAN

• **NORWEGIAN**

##### Defined in

[enums.ts:59](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L59)

___

#### POLISH

• **POLISH**

##### Defined in

[enums.ts:57](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L57)

___

#### PORTUGUESE

• **PORTUGUESE**

##### Defined in

[enums.ts:58](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L58)

___

#### PUNJABI

• **PUNJABI**

##### Defined in

[enums.ts:74](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L74)

___

#### ROMANIAN

• **ROMANIAN**

##### Defined in

[enums.ts:73](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L73)

___

#### RUSSIAN

• **RUSSIAN**

##### Defined in

[enums.ts:50](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L50)

___

#### SLOVAK

• **SLOVAK**

##### Defined in

[enums.ts:72](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L72)

___

#### SPANISH

• **SPANISH**

##### Defined in

[enums.ts:47](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L47)

___

#### SWEDISH

• **SWEDISH**

##### Defined in

[enums.ts:51](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L51)

___

#### TAMIL

• **TAMIL**

##### Defined in

[enums.ts:70](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L70)

___

#### TURKISH

• **TURKISH**

##### Defined in

[enums.ts:52](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L52)

___

#### UKRANIAN

• **UKRANIAN**

##### Defined in

[enums.ts:71](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L71)

___

#### VIETNAMESE

• **VIETNAMESE**

##### Defined in

[enums.ts:63](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L63)


<a name="enumsenumsnotificationmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Notification

## Enumeration: Notification

[enums](#modulesenumsmd).Notification

### Table of contents

#### Enumeration Members

- [ALERT](#alert)
- [BROADCAST](#broadcast)
- [CANCEL](#cancel)
- [NOTIFY](#notify)

### Enumeration Members

#### ALERT

• **ALERT**

##### Defined in

[enums.ts:111](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L111)

___

#### BROADCAST

• **BROADCAST**

##### Defined in

[enums.ts:110](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L110)

___

#### CANCEL

• **CANCEL**

##### Defined in

[enums.ts:113](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L113)

___

#### NOTIFY

• **NOTIFY**

##### Defined in

[enums.ts:112](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L112)


<a name="enumsenumsnotificationprioritymd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / NotificationPriority

## Enumeration: NotificationPriority

[enums](#modulesenumsmd).NotificationPriority

### Table of contents

#### Enumeration Members

- [CRITICAL](#critical)
- [HIGH](#high)
- [NORMAL](#normal)

### Enumeration Members

#### CRITICAL

• **CRITICAL**

##### Defined in

[enums.ts:124](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L124)

___

#### HIGH

• **HIGH**

##### Defined in

[enums.ts:123](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L123)

___

#### NORMAL

• **NORMAL**

##### Defined in

[enums.ts:122](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L122)


<a name="enumsenumsnotificationsoundmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / NotificationSound

## Enumeration: NotificationSound

[enums](#modulesenumsmd).NotificationSound

### Table of contents

#### Enumeration Members

- [DEFAULT](#default)
- [SOS](#sos)

### Enumeration Members

#### DEFAULT

• **DEFAULT**

##### Defined in

[enums.ts:128](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L128)

___

#### SOS

• **SOS**

##### Defined in

[enums.ts:129](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L129)


<a name="enumsenumstapsmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Taps

## Enumeration: Taps

[enums](#modulesenumsmd).Taps

### Table of contents

#### Enumeration Members

- [DOUBLE](#double)
- [LONG](#long)
- [SINGLE](#single)
- [TRIPLE](#triple)

### Enumeration Members

#### DOUBLE

• **DOUBLE**

##### Defined in

[enums.ts:39](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L39)

___

#### LONG

• **LONG**

##### Defined in

[enums.ts:41](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L41)

___

#### SINGLE

• **SINGLE**

##### Defined in

[enums.ts:38](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L38)

___

#### TRIPLE

• **TRIPLE**

##### Defined in

[enums.ts:40](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L40)


<a name="enumsenumstimeouttypemd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / TimeoutType

## Enumeration: TimeoutType

[enums](#modulesenumsmd).TimeoutType

### Table of contents

#### Enumeration Members

- [HOURS](#hours)
- [MILLISECONDS](#milliseconds)
- [MINUTES](#minutes)
- [SECONDS](#seconds)

### Enumeration Members

#### HOURS

• **HOURS**

##### Defined in

[enums.ts:141](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L141)

___

#### MILLISECONDS

• **MILLISECONDS**

##### Defined in

[enums.ts:138](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L138)

___

#### MINUTES

• **MINUTES**

##### Defined in

[enums.ts:140](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L140)

___

#### SECONDS

• **SECONDS**

##### Defined in

[enums.ts:139](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L139)


<a name="enumsenumstimertypemd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / TimerType

## Enumeration: TimerType

[enums](#modulesenumsmd).TimerType

### Table of contents

#### Enumeration Members

- [INTERVAL](#interval)
- [TIMEOUT](#timeout)

### Enumeration Members

#### INTERVAL

• **INTERVAL**

##### Defined in

[enums.ts:134](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L134)

___

#### TIMEOUT

• **TIMEOUT**

##### Defined in

[enums.ts:133](https://github.com/relaypro/relay-js/blob/b16ef5f/src/enums.ts#L133)

# Interfaces


<a name="interfacestypesrelaymd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [types](#modulestypesmd) / Relay

## Interface: Relay

[types](#modulestypesmd).Relay

### Table of contents

#### Properties

- [api](#api)

#### Methods

- [workflow](#workflow)

### Properties

#### api

• **api**: [`default`](#classesapidefaultmd)

##### Defined in

[types.ts:43](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L43)

### Methods

#### workflow

▸ **workflow**(`path`, `workflow?`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` \| [`WorkflowEventHandler`](#interfacestypesworkfloweventhandlermd) |
| `workflow?` | [`WorkflowEventHandler`](#interfacestypesworkfloweventhandlermd) |

##### Returns

`void`

##### Defined in

[types.ts:42](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L42)


<a name="interfacestypesworkfloweventhandlermd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [types](#modulestypesmd) / WorkflowEventHandler

## Interface: WorkflowEventHandler

[types](#modulestypesmd).WorkflowEventHandler

### Callable

#### WorkflowEventHandler

▸ **WorkflowEventHandler**(`workflow`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `workflow` | [`Workflow`](#classesindexworkflowmd) |

##### Returns

`void`

##### Defined in

[types.ts:38](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L38)


<a name="modulesmd"></a>

[@relaypro/sdk](#readmemd) / Exports

# @relaypro/sdk

## Table of contents

### Modules

- [api](#modulesapimd)
- [constants](#modulesconstantsmd)
- [enums](#modulesenumsmd)
- [index](#modulesindexmd)
- [queue](#modulesqueuemd)
- [types](#modulestypesmd)
- [uri](#modulesurimd)
- [utils](#modulesutilsmd)
- [vars](#modulesvarsmd)

# Modules


<a name="modulesapimd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / api

## Module: api

### Table of contents

#### Classes

- [default](#classesapidefaultmd)


<a name="modulesconstantsmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / constants

## Module: constants

### Table of contents

#### Variables

- [ERROR\_RESPONSE](#error_response)
- [EVENT\_TIMEOUT](#event_timeout)
- [HEARTBEAT](#heartbeat)
- [NON\_INTERACTIVE\_ACTIONS](#non_interactive_actions)
- [NOTIFICATION\_TIMEOUT](#notification_timeout)
- [PORT](#port)
- [PROGRESS\_EVENT](#progress_event)
- [REFRESH\_TIMEOUT](#refresh_timeout)
- [TIMEOUT](#timeout)

### Variables

#### ERROR\_RESPONSE

• `Const` **ERROR\_RESPONSE**: ``"wf_api_error_response"``

##### Defined in

[constants.ts:11](https://github.com/relaypro/relay-js/blob/b16ef5f/src/constants.ts#L11)

___

#### EVENT\_TIMEOUT

• `Const` **EVENT\_TIMEOUT**: ``32000``

##### Defined in

[constants.ts:7](https://github.com/relaypro/relay-js/blob/b16ef5f/src/constants.ts#L7)

___

#### HEARTBEAT

• `Const` **HEARTBEAT**: `number`

##### Defined in

[constants.ts:4](https://github.com/relaypro/relay-js/blob/b16ef5f/src/constants.ts#L4)

___

#### NON\_INTERACTIVE\_ACTIONS

• `Const` **NON\_INTERACTIVE\_ACTIONS**: `string`[]

##### Defined in

[constants.ts:15](https://github.com/relaypro/relay-js/blob/b16ef5f/src/constants.ts#L15)

___

#### NOTIFICATION\_TIMEOUT

• `Const` **NOTIFICATION\_TIMEOUT**: ``60000``

##### Defined in

[constants.ts:9](https://github.com/relaypro/relay-js/blob/b16ef5f/src/constants.ts#L9)

___

#### PORT

• `Const` **PORT**: `number`

##### Defined in

[constants.ts:3](https://github.com/relaypro/relay-js/blob/b16ef5f/src/constants.ts#L3)

___

#### PROGRESS\_EVENT

• `Const` **PROGRESS\_EVENT**: ``"wf_api_progress_event"``

##### Defined in

[constants.ts:12](https://github.com/relaypro/relay-js/blob/b16ef5f/src/constants.ts#L12)

___

#### REFRESH\_TIMEOUT

• `Const` **REFRESH\_TIMEOUT**: ``45000``

##### Defined in

[constants.ts:8](https://github.com/relaypro/relay-js/blob/b16ef5f/src/constants.ts#L8)

___

#### TIMEOUT

• `Const` **TIMEOUT**: ``5000``

##### Defined in

[constants.ts:6](https://github.com/relaypro/relay-js/blob/b16ef5f/src/constants.ts#L6)


<a name="modulesenumsmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / enums

## Module: enums

### Table of contents

#### Enumerations

- [Button](#enumsenumsbuttonmd)
- [CallDirection](#enumsenumscalldirectionmd)
- [DeviceInfoField](#enumsenumsdeviceinfofieldmd)
- [DeviceInfoQuery](#enumsenumsdeviceinfoquerymd)
- [DeviceType](#enumsenumsdevicetypemd)
- [Event](#enumsenumseventmd)
- [IncidentStatus](#enumsenumsincidentstatusmd)
- [Language](#enumsenumslanguagemd)
- [Notification](#enumsenumsnotificationmd)
- [NotificationPriority](#enumsenumsnotificationprioritymd)
- [NotificationSound](#enumsenumsnotificationsoundmd)
- [Taps](#enumsenumstapsmd)
- [TimeoutType](#enumsenumstimeouttypemd)
- [TimerType](#enumsenumstimertypemd)


<a name="modulesindexmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / index

## Module: index

### Table of contents

#### References

- [Button](#button)
- [CallDirection](#calldirection)
- [DeviceInfoField](#deviceinfofield)
- [DeviceInfoQuery](#deviceinfoquery)
- [DeviceType](#devicetype)
- [IncidentStatus](#incidentstatus)
- [Notification](#notification)
- [NotificationPriority](#notificationpriority)
- [NotificationSound](#notificationsound)
- [Options](#options)
- [Relay](#relay)
- [Taps](#taps)
- [TimeoutType](#timeouttype)
- [TimerType](#timertype)
- [Uri](#uri)
- [WorkflowEventHandler](#workfloweventhandler)

#### Classes

- [Workflow](#classesindexworkflowmd)

#### Variables

- [Event](#event)
- [Language](#language)

#### Functions

- [createWorkflow](#createworkflow)
- [relay](#relay-1)

### References

#### Button

Re-exports [Button](#enumsenumsbuttonmd)

___

#### CallDirection

Re-exports [CallDirection](#enumsenumscalldirectionmd)

___

#### DeviceInfoField

Re-exports [DeviceInfoField](#enumsenumsdeviceinfofieldmd)

___

#### DeviceInfoQuery

Re-exports [DeviceInfoQuery](#enumsenumsdeviceinfoquerymd)

___

#### DeviceType

Re-exports [DeviceType](#enumsenumsdevicetypemd)

___

#### IncidentStatus

Re-exports [IncidentStatus](#enumsenumsincidentstatusmd)

___

#### Notification

Re-exports [Notification](#enumsenumsnotificationmd)

___

#### NotificationPriority

Re-exports [NotificationPriority](#enumsenumsnotificationprioritymd)

___

#### NotificationSound

Re-exports [NotificationSound](#enumsenumsnotificationsoundmd)

___

#### Options

Re-exports [Options](#options)

___

#### Relay

Re-exports [Relay](#interfacestypesrelaymd)

___

#### Taps

Re-exports [Taps](#enumsenumstapsmd)

___

#### TimeoutType

Re-exports [TimeoutType](#enumsenumstimeouttypemd)

___

#### TimerType

Re-exports [TimerType](#enumsenumstimertypemd)

___

#### Uri

Renames and re-exports [uri](#modulesurimd)

___

#### WorkflowEventHandler

Re-exports [WorkflowEventHandler](#interfacestypesworkfloweventhandlermd)

### Variables

#### Event

• **Event**: typeof [`Event`](#enumsenumseventmd)

___

#### Language

• **Language**: typeof [`Language`](#enumsenumslanguagemd)

### Functions

#### createWorkflow

▸ **createWorkflow**(`fn`): [`Workflow`](#classesindexworkflowmd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | [`Workflow`](#classesindexworkflowmd) |

##### Returns

[`Workflow`](#classesindexworkflowmd)

##### Defined in

[index.ts:53](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L53)

___

#### relay

▸ **relay**(`options?`): [`Relay`](#interfacestypesrelaymd)

##### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`Options`](#options) |

##### Returns

[`Relay`](#interfacestypesrelaymd)

##### Defined in

[index.ts:772](https://github.com/relaypro/relay-js/blob/b16ef5f/src/index.ts#L772)


<a name="modulesqueuemd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / queue

## Module: queue


<a name="modulestypesmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / types

## Module: types

### Table of contents

#### Interfaces

- [Relay](#interfacestypesrelaymd)
- [WorkflowEventHandler](#interfacestypesworkfloweventhandlermd)

#### Type Aliases

- [AnyEvent](#anyevent)
- [AnyPrimitive](#anyprimitive)
- [AudioResponse](#audioresponse)
- [BaseCallEvent](#basecallevent)
- [ButtonEvent](#buttonevent)
- [ButtonTrigger](#buttontrigger)
- [Call](#call)
- [ConnectedCallEvent](#connectedcallevent)
- [Device](#device)
- [DisconnectedCallEvent](#disconnectedcallevent)
- [ErrorEvent](#errorevent)
- [Event](#event)
- [FailedCallEvent](#failedcallevent)
- [GroupTarget](#grouptarget)
- [HomeChannelBehavior](#homechannelbehavior)
- [HttpTrigger](#httptrigger)
- [IncidentEvent](#incidentevent)
- [InputType](#inputtype)
- [InteractionLifecycle](#interactionlifecycle)
- [InteractionLifecycleEvent](#interactionlifecycleevent)
- [InteractionOptions](#interactionoptions)
- [LedEffect](#ledeffect)
- [LedIndex](#ledindex)
- [LedInfo](#ledinfo)
- [ListenResponse](#listenresponse)
- [LocalWebSocket](#localwebsocket)
- [Mapper](#mapper)
- [Maybe](#maybe)
- [NfcTrigger](#nfctrigger)
- [NotificationEvent](#notificationevent)
- [NotificationOptions](#notificationoptions)
- [NotificationState](#notificationstate)
- [Options](#options)
- [OtherTrigger](#othertrigger)
- [PhraseTrigger](#phrasetrigger)
- [PlaceCall](#placecall)
- [ProgressingCallEvent](#progressingcallevent)
- [PromptEvent](#promptevent)
- [RawWorkflowEvent](#rawworkflowevent)
- [ReceivedCallEvent](#receivedcallevent)
- [RegisterRequest](#registerrequest)
- [RingingCallEvent](#ringingcallevent)
- [SingleTarget](#singletarget)
- [SpeechEvent](#speechevent)
- [StartEvent](#startevent)
- [StartedCallEvent](#startedcallevent)
- [StopEvent](#stopevent)
- [Target](#target)
- [TargetUris](#targeturis)
- [TimerEvent](#timerevent)
- [TrackEventParameters](#trackeventparameters)
- [TranscriptionResponse](#transcriptionresponse)
- [TriggerArgs](#triggerargs)
- [UnionToIntersection](#uniontointersection)
- [UnregisterRequest](#unregisterrequest)
- [ValueOf](#valueof)
- [WorkflowEventHandlers](#workfloweventhandlers)

### Type Aliases

#### AnyEvent

Ƭ **AnyEvent**: `Error`

##### Defined in

[types.ts:196](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L196)

___

#### AnyPrimitive

Ƭ **AnyPrimitive**: `undefined` \| `symbol` \| `string` \| `boolean` \| `number` \| [`string` \| `boolean` \| `number`]

##### Defined in

[types.ts:233](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L233)

___

#### AudioResponse

Ƭ **AudioResponse**: `Record`<``"audio"``, `string`\>

##### Defined in

[types.ts:229](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L229)

___

#### BaseCallEvent

Ƭ **BaseCallEvent**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `call_id` | `string` |

##### Defined in

[types.ts:282](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L282)

___

#### ButtonEvent

Ƭ **ButtonEvent**: [`Event`](#event) & { `button`: [`Button`](#enumsenumsbuttonmd) ; `taps`: [`Taps`](#enumsenumstapsmd)  }

##### Defined in

[types.ts:167](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L167)

___

#### ButtonTrigger

Ƭ **ButtonTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) & { `action`: ``"action_button_single_tap"`` \| ``"action_button_double_tap"`` \| ``"action_button_triple_tap"``  } |
| `type` | ``"button"`` |

##### Defined in

[types.ts:100](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L100)

___

#### Call

Ƭ **Call**: [`StartedCallEvent`](#startedcallevent) \| [`ReceivedCallEvent`](#receivedcallevent) \| [`ConnectedCallEvent`](#connectedcallevent) \| [`DisconnectedCallEvent`](#disconnectedcallevent) \| [`FailedCallEvent`](#failedcallevent)

##### Defined in

[types.ts:304](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L304)

___

#### ConnectedCallEvent

Ƭ **ConnectedCallEvent**: [`ReceivedCallEvent`](#receivedcallevent) & { `connect_time_epoch`: `number`  }

##### Defined in

[types.ts:296](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L296)

___

#### Device

Ƭ **Device**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `active_channel` | `string` |
| `app_version` | `string` |
| `background_audio` | `boolean` |
| `battery_level` | `number` |
| `battery_status` | ``"charging"`` \| ``"discharging"`` |
| `bluetooth_address` | `string` |
| `bluetooth_name` | `string` |
| `bluetooth_status` | ``"on"`` \| ``"off"`` |
| `build_id` | `string` |
| `capabilities` | { `allow_sos_override`: `boolean` ; `audit_rich_logging`: `boolean` ; `background_audio`: `boolean` ; `calling`: `boolean` ; `calling_between_devices_support`: `boolean` ; `devmon_event_support`: `boolean` ; `dnd`: `boolean` ; `eavesdrop_support`: `boolean` ; `enable_audit_logs`: `boolean` ; `enable_team_support`: `boolean` ; `escalated_sos`: `boolean` ; `geofencing`: `boolean` ; `group_persistence`: `boolean` ; `group_transcriptions`: `boolean` ; `group_translations`: `boolean` ; `indoor_positioning`: `boolean` ; `intent_support`: `boolean` ; `location`: `boolean` ; `location_history`: `boolean` ; `low_latency_audio`: `boolean` ; `sip_register_support`: `boolean` ; `sos`: `boolean` ; `ui_allow_incident_resolution`: `boolean` ; `virtual_device_location_reporting`: `boolean`  } |
| `capabilities.allow_sos_override` | `boolean` |
| `capabilities.audit_rich_logging` | `boolean` |
| `capabilities.background_audio` | `boolean` |
| `capabilities.calling` | `boolean` |
| `capabilities.calling_between_devices_support` | `boolean` |
| `capabilities.devmon_event_support` | `boolean` |
| `capabilities.dnd` | `boolean` |
| `capabilities.eavesdrop_support` | `boolean` |
| `capabilities.enable_audit_logs` | `boolean` |
| `capabilities.enable_team_support` | `boolean` |
| `capabilities.escalated_sos` | `boolean` |
| `capabilities.geofencing` | `boolean` |
| `capabilities.group_persistence` | `boolean` |
| `capabilities.group_transcriptions` | `boolean` |
| `capabilities.group_translations` | `boolean` |
| `capabilities.indoor_positioning` | `boolean` |
| `capabilities.intent_support` | `boolean` |
| `capabilities.location` | `boolean` |
| `capabilities.location_history` | `boolean` |
| `capabilities.low_latency_audio` | `boolean` |
| `capabilities.sip_register_support` | `boolean` |
| `capabilities.sos` | `boolean` |
| `capabilities.ui_allow_incident_resolution` | `boolean` |
| `capabilities.virtual_device_location_reporting` | `boolean` |
| `cell_signal` | `number` |
| `channels` | { `catalog_type`: `string` ; `channel_id`: `string` ; `color`: `string` ; `force_switch_on_page`: `boolean` ; `is_hidden`: `boolean` ; `name`: `string` ; `params`: `Record`<`string`, `string`\> ; `type`: `string`  }[] |
| `connection_type` | ``"cell"`` \| ``"wifi"`` |
| `device_status` | ``"online"`` \| ``"offline"`` |
| `emergency_info` | `never` |
| `fcc_id` | `string` |
| `features` | { `auto_dnd_when_charging`: `boolean` ; `background_audio`: `boolean` ; `background_notification_repeat_interval`: `number` ; `cache_wifi_for_location`: `boolean` ; `calling`: `boolean` ; `calling_notifications`: `boolean` ; `dnd`: `boolean` ; `enable_event_stream`: `boolean` ; `foreground_notification_repeat_interval`: `number` ; `home_channel_name`: `string` ; `home_channel_timeout`: `number` ; `indoor_position_algorithm`: `string` ; `indoor_positioning`: `boolean` ; `location`: `boolean` ; `location_polling_interval`: `number` ; `ping_interval`: `number` ; `prefer_cell`: `boolean` ; `sensors_enabled`: `string`[] ; `sos`: `boolean` ; `use_ibot_transcriptions`: ``false``  } |
| `features.auto_dnd_when_charging` | `boolean` |
| `features.background_audio` | `boolean` |
| `features.background_notification_repeat_interval` | `number` |
| `features.cache_wifi_for_location` | `boolean` |
| `features.calling` | `boolean` |
| `features.calling_notifications` | `boolean` |
| `features.dnd` | `boolean` |
| `features.enable_event_stream` | `boolean` |
| `features.foreground_notification_repeat_interval` | `number` |
| `features.home_channel_name` | `string` |
| `features.home_channel_timeout` | `number` |
| `features.indoor_position_algorithm` | `string` |
| `features.indoor_positioning` | `boolean` |
| `features.location` | `boolean` |
| `features.location_polling_interval` | `number` |
| `features.ping_interval` | `number` |
| `features.prefer_cell` | `boolean` |
| `features.sensors_enabled` | `string`[] |
| `features.sos` | `boolean` |
| `features.use_ibot_transcriptions` | ``false`` |
| `groups` | { `group_id`: `string` ; `name`: `string`  }[] |
| `ic_id` | `string` |
| `iccid` | `string` |
| `imei` | `string` |
| `last_connect_timestamp` | `string` |
| `location` | { `accuracy`: `number` ; `address`: `string` \| ``null`` ; `date`: `string` ; `geofence_events`: { `geofence_id`: `string` ; `label`: `string` ; `timestamp_z`: `string` ; `type`: ``"entry"`` \| ``"exit"``  }[] ; `geofence_id`: `string` \| ``null`` ; `geofence_state`: ``"outside"`` \| ``"inside"`` \| ``null`` ; `indoor_position`: { `best`: `number` ; `best_match`: `string`[] ; `best_match_id`: `string` ; `best_match_mac`: `string` ; `best_match_venue`: `string`  } ; `lat`: `number` ; `long`: `number`  } |
| `location.accuracy` | `number` |
| `location.address` | `string` \| ``null`` |
| `location.date` | `string` |
| `location.geofence_events` | { `geofence_id`: `string` ; `label`: `string` ; `timestamp_z`: `string` ; `type`: ``"entry"`` \| ``"exit"``  }[] |
| `location.geofence_id` | `string` \| ``null`` |
| `location.geofence_state` | ``"outside"`` \| ``"inside"`` \| ``null`` |
| `location.indoor_position` | { `best`: `number` ; `best_match`: `string`[] ; `best_match_id`: `string` ; `best_match_mac`: `string` ; `best_match_venue`: `string`  } |
| `location.indoor_position.best` | `number` |
| `location.indoor_position.best_match` | `string`[] |
| `location.indoor_position.best_match_id` | `string` |
| `location.indoor_position.best_match_mac` | `string` |
| `location.indoor_position.best_match_venue` | `string` |
| `location.lat` | `number` |
| `location.long` | `number` |
| `mode` | ``null`` \| ``"emergency_sos"`` \| ``"dnd"`` |
| `model` | `string` |
| `name` | `string` |
| `product_name` | `string` |
| `rendezvous` | `never`[] |
| `rom_version` | `string` |
| `volume_level` | `number` |
| `wifi_mac` | `string` |
| `wifi_signal` | `number` |

##### Defined in

[types.ts:310](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L310)

___

#### DisconnectedCallEvent

Ƭ **DisconnectedCallEvent**: [`ConnectedCallEvent`](#connectedcallevent) & { `end_time_epoch`: `number` ; `reason`: `string`  }

##### Defined in

[types.ts:299](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L299)

___

#### ErrorEvent

Ƭ **ErrorEvent**: `Object`

ErrorEvent is not emitted from Relay Platform. Rather it is emitted from
the SDK when an exception goes unhandled by user code.

##### Type declaration

| Name | Type |
| :------ | :------ |
| `error` | `Error` |

##### Defined in

[types.ts:155](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L155)

___

#### Event

Ƭ **Event**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `source_uri` | `string` |

##### Defined in

[types.ts:147](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L147)

___

#### FailedCallEvent

Ƭ **FailedCallEvent**: [`DisconnectedCallEvent`](#disconnectedcallevent)

##### Defined in

[types.ts:303](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L303)

___

#### GroupTarget

Ƭ **GroupTarget**: `string`

##### Defined in

[types.ts:207](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L207)

___

#### HomeChannelBehavior

Ƭ **HomeChannelBehavior**: ``"suspend"`` \| ``"normal"``

##### Defined in

[types.ts:220](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L220)

___

#### HttpTrigger

Ƭ **HttpTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) & { `args`: `Record`<`string`, `string`\>  } |
| `type` | ``"http"`` |

##### Defined in

[types.ts:107](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L107)

___

#### IncidentEvent

Ƭ **IncidentEvent**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `incident_id` | `string` |
| `reason` | `string` |
| `type` | [`IncidentStatus`](#enumsenumsincidentstatusmd) |

##### Defined in

[types.ts:198](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L198)

___

#### InputType

Ƭ **InputType**: ``"action_button_single_tap"`` \| ``"action_button_double_tap"`` \| ``"action_button_triple_tap"`` \| ``"action_button_long_press"`` \| ``"channel_button_double_tap"`` \| ``"channel_button_triple_tap"``

##### Defined in

[types.ts:213](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L213)

___

#### InteractionLifecycle

Ƭ **InteractionLifecycle**: ``"started"`` \| ``"resumed"`` \| ``"suspended"`` \| ``"ended"`` \| ``"failed"``

##### Defined in

[types.ts:141](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L141)

___

#### InteractionLifecycleEvent

Ƭ **InteractionLifecycleEvent**: [`Event`](#event) & { `reason?`: `string` ; `type`: `string`  }

##### Defined in

[types.ts:134](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L134)

___

#### InteractionOptions

Ƭ **InteractionOptions**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `color?` | `string` |
| `home_channel?` | [`HomeChannelBehavior`](#homechannelbehavior) |
| `input_types?` | [[`InputType`](#inputtype)] |

##### Defined in

[types.ts:222](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L222)

___

#### LedEffect

Ƭ **LedEffect**: ``"off"`` \| ``"breathe"`` \| ``"flash"`` \| ``"rotate"`` \| ``"rainbow"`` \| ``"static"``

##### Defined in

[types.ts:240](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L240)

___

#### LedIndex

Ƭ **LedIndex**: ``"ring"`` \| ``1`` \| ``2`` \| ``3`` \| ``4`` \| ``5`` \| ``6`` \| ``7`` \| ``8`` \| ``9`` \| ``10`` \| ``11`` \| ``12`` \| ``13`` \| ``14`` \| ``15`` \| ``16`` \| ``"1"`` \| ``"2"`` \| ``"3"`` \| ``"4"`` \| ``"5"`` \| ``"6"`` \| ``"7"`` \| ``"8"`` \| ``"9"`` \| ``"10"`` \| ``"11"`` \| ``"12"`` \| ``"13"`` \| ``"14"`` \| ``"15"`` \| ``"16"``

##### Defined in

[types.ts:239](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L239)

___

#### LedInfo

Ƭ **LedInfo**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `colors?` | { [K in LedIndex]?: string } |
| `count?` | `number` |
| `duration?` | `number` |
| `pattern_repeats?` | `number` |
| `repeat_delay?` | `number` |
| `rotations?` | `number` |

##### Defined in

[types.ts:241](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L241)

___

#### ListenResponse

Ƭ **ListenResponse**: [`TranscriptionResponse`](#transcriptionresponse) \| [`AudioResponse`](#audioresponse)

##### Defined in

[types.ts:231](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L231)

___

#### LocalWebSocket

Ƭ **LocalWebSocket**: `WebSocket` & { `connectionId`: `string` ; `isAlive`: `boolean`  }

##### Defined in

[types.ts:32](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L32)

___

#### Mapper

Ƭ **Mapper**<`Type`\>: (`value`: `string`) => `Type`

##### Type parameters

| Name |
| :------ |
| `Type` |

##### Type declaration

▸ (`value`): `Type`

###### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

###### Returns

`Type`

##### Defined in

[types.ts:235](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L235)

___

#### Maybe

Ƭ **Maybe**<`T`\>: `T` \| ``null`` \| `undefined`

##### Type parameters

| Name |
| :------ |
| `T` |

##### Defined in

[types.ts:20](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L20)

___

#### NfcTrigger

Ƭ **NfcTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) & { `nfc_payload`: `Record`<`string`, `string`\> ; `uid`: `string`  } |
| `type` | ``"nfc"`` |

##### Defined in

[types.ts:114](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L114)

___

#### NotificationEvent

Ƭ **NotificationEvent**: [`Event`](#event) & { `event`: `string` ; `name`: `string` ; `notification_state`: [`NotificationState`](#notificationstate)  }

##### Defined in

[types.ts:174](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L174)

___

#### NotificationOptions

Ƭ **NotificationOptions**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `body` | `string` |
| `priority` | [`NotificationPriority`](#enumsenumsnotificationprioritymd) |
| `sound` | [`NotificationSound`](#enumsenumsnotificationsoundmd) |
| `title` | `string` |

##### Defined in

[types.ts:256](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L256)

___

#### NotificationState

Ƭ **NotificationState**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `acknowledged` | `string`[] |
| `cancelled` | `string`[] |
| `created` | `string`[] |
| `timed_out` | `string`[] |

##### Defined in

[types.ts:263](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L263)

___

#### Options

Ƭ **Options**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `apiKey?` | `string` |
| `server?` | `http.Server` \| `https.Server` |
| `subscriberId?` | `string` |

##### Defined in

[types.ts:26](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L26)

___

#### OtherTrigger

Ƭ **OtherTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) |
| `type` | ``"emergency"`` \| ``"other"`` \| ``"calendar"`` \| ``"geofence"`` \| ``"telephony"`` |

##### Defined in

[types.ts:123](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L123)

___

#### PhraseTrigger

Ƭ **PhraseTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) & { `phrase`: `string` ; `spillover`: `string`  } |
| `type` | ``"phrase"`` |

##### Defined in

[types.ts:92](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L92)

___

#### PlaceCall

Ƭ **PlaceCall**: `Partial`<`Omit`<[`StartedCallEvent`](#startedcallevent), ``"call_id"``\>\>

##### Defined in

[types.ts:288](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L288)

___

#### ProgressingCallEvent

Ƭ **ProgressingCallEvent**: [`ReceivedCallEvent`](#receivedcallevent)

##### Defined in

[types.ts:295](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L295)

___

#### PromptEvent

Ƭ **PromptEvent**: [`Event`](#event) & { `id`: `string` ; `type`: `string`  }

##### Defined in

[types.ts:189](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L189)

___

#### RawWorkflowEvent

Ƭ **RawWorkflowEvent**: [`UnionToIntersection`](#uniontointersection)<`WorkflowEvent`\> & { `_id`: `string` ; `_type`: `string`  }

##### Defined in

[types.ts:75](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L75)

___

#### ReceivedCallEvent

Ƭ **ReceivedCallEvent**: [`StartedCallEvent`](#startedcallevent) & { `direction`: [`CallDirection`](#enumsenumscalldirectionmd) ; `onnet`: `boolean` ; `start_time_epoch`: `number`  }

##### Defined in

[types.ts:289](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L289)

___

#### RegisterRequest

Ƭ **RegisterRequest**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `expires?` | `number` |
| `password?` | `string` |
| `uri?` | `string` |

##### Defined in

[types.ts:274](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L274)

___

#### RingingCallEvent

Ƭ **RingingCallEvent**: [`ReceivedCallEvent`](#receivedcallevent)

##### Defined in

[types.ts:294](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L294)

___

#### SingleTarget

Ƭ **SingleTarget**: `string`

##### Defined in

[types.ts:208](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L208)

___

#### SpeechEvent

Ƭ **SpeechEvent**: [`Event`](#event) & { `audio`: `string` ; `lang`: `string` ; `request_id`: `string` ; `text`: `string`  }

##### Defined in

[types.ts:180](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L180)

___

#### StartEvent

Ƭ **StartEvent**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `trigger` | [`PhraseTrigger`](#phrasetrigger) \| [`ButtonTrigger`](#buttontrigger) \| [`HttpTrigger`](#httptrigger) \| [`NfcTrigger`](#nfctrigger) \| [`OtherTrigger`](#othertrigger) |

##### Defined in

[types.ts:159](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L159)

___

#### StartedCallEvent

Ƭ **StartedCallEvent**: [`BaseCallEvent`](#basecallevent) & { `uri`: `string`  }

##### Defined in

[types.ts:285](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L285)

___

#### StopEvent

Ƭ **StopEvent**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `reason` | ``"error"`` \| ``"normal"`` \| `string` |

##### Defined in

[types.ts:163](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L163)

___

#### Target

Ƭ **Target**: [`SingleTarget`](#singletarget) \| `string`[]

##### Defined in

[types.ts:209](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L209)

___

#### TargetUris

Ƭ **TargetUris**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `uris` | `string`[] |

##### Defined in

[types.ts:210](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L210)

___

#### TimerEvent

Ƭ **TimerEvent**: `Record`<``"name"``, `string`\>

##### Defined in

[types.ts:172](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L172)

___

#### TrackEventParameters

Ƭ **TrackEventParameters**: `Record`<`string`, `Record`<`string`, `string` \| `number` \| `boolean`\>\>

##### Defined in

[types.ts:308](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L308)

___

#### TranscriptionResponse

Ƭ **TranscriptionResponse**: `Record`<``"text"`` \| ``"lang"``, `string`\>

##### Defined in

[types.ts:228](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L228)

___

#### TriggerArgs

Ƭ **TriggerArgs**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `source_uri` | `string` |

##### Defined in

[types.ts:88](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L88)

___

#### UnionToIntersection

Ƭ **UnionToIntersection**<`T`\>: `T` extends `any` ? (`x`: `T`) => `any` : `never` extends (`x`: infer R) => `any` ? `R` : `never`

##### Type parameters

| Name |
| :------ |
| `T` |

##### Defined in

[types.ts:24](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L24)

___

#### UnregisterRequest

Ƭ **UnregisterRequest**: `Omit`<[`RegisterRequest`](#registerrequest), ``"expires"``\>

##### Defined in

[types.ts:280](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L280)

___

#### ValueOf

Ƭ **ValueOf**<`T`\>: `T`[keyof `T`]

##### Type parameters

| Name |
| :------ |
| `T` |

##### Defined in

[types.ts:22](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L22)

___

#### WorkflowEventHandlers

Ƭ **WorkflowEventHandlers**: { [EventName in keyof WorkflowEventMappings]?: Function }

##### Defined in

[types.ts:80](https://github.com/relaypro/relay-js/blob/b16ef5f/src/types.ts#L80)


<a name="modulesurimd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / uri

## Module: uri

### Table of contents

#### Functions

- [allDevices](#alldevices)
- [allDevicesWithStatus](#alldeviceswithstatus)
- [assertTargets](#asserttargets)
- [deviceId](#deviceid)
- [deviceName](#devicename)
- [genericOriginator](#genericoriginator)
- [groupId](#groupid)
- [groupMember](#groupmember)
- [groupName](#groupname)
- [isInteractionUri](#isinteractionuri)
- [isRelayUri](#isrelayuri)
- [makeTargetUris](#maketargeturis)
- [parseDeviceId](#parsedeviceid)
- [parseDeviceName](#parsedevicename)
- [parseGroupId](#parsegroupid)
- [parseGroupName](#parsegroupname)

### Functions

#### allDevices

▸ **allDevices**(): `string`

##### Returns

`string`

##### Defined in

[uri.ts:140](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L140)

___

#### allDevicesWithStatus

▸ **allDevicesWithStatus**(`interactionName`, `status`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `interactionName` | `string` |
| `status` | [`InteractionLifecycle`](#interactionlifecycle) |

##### Returns

`string`

##### Defined in

[uri.ts:133](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L133)

___

#### assertTargets

▸ **assertTargets**(`target`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |

##### Returns

`boolean`

##### Defined in

[uri.ts:144](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L144)

___

#### deviceId

▸ **deviceId**(`id`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

##### Returns

`string`

##### Defined in

[uri.ts:130](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L130)

___

#### deviceName

▸ **deviceName**(`name`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

##### Returns

`string`

##### Defined in

[uri.ts:131](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L131)

___

#### genericOriginator

▸ **genericOriginator**(): `string`

##### Returns

`string`

##### Defined in

[uri.ts:142](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L142)

___

#### groupId

▸ **groupId**(`id`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

##### Returns

`string`

##### Defined in

[uri.ts:126](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L126)

___

#### groupMember

▸ **groupMember**(`group`, `device`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `group` | `string` |
| `device` | `string` |

##### Returns

`string`

##### Defined in

[uri.ts:128](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L128)

___

#### groupName

▸ **groupName**(`name`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

##### Returns

`string`

##### Defined in

[uri.ts:127](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L127)

___

#### isInteractionUri

▸ **isInteractionUri**(`uri`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |

##### Returns

`void`

##### Defined in

[uri.ts:163](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L163)

___

#### isRelayUri

▸ **isRelayUri**(`uri`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |

##### Returns

`boolean`

##### Defined in

[uri.ts:167](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L167)

___

#### makeTargetUris

▸ **makeTargetUris**(`target`): [`TargetUris`](#targeturis)

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | [`Target`](#target) |

##### Returns

[`TargetUris`](#targeturis)

##### Defined in

[uri.ts:153](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L153)

___

#### parseDeviceId

▸ **parseDeviceId**(`uri`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |

##### Returns

`string`

##### Defined in

[uri.ts:70](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L70)

___

#### parseDeviceName

▸ **parseDeviceName**(`uri`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |

##### Returns

`string`

##### Defined in

[uri.ts:61](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L61)

___

#### parseGroupId

▸ **parseGroupId**(`uri`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |

##### Returns

`string`

##### Defined in

[uri.ts:106](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L106)

___

#### parseGroupName

▸ **parseGroupName**(`uri`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |

##### Returns

`string`

##### Defined in

[uri.ts:97](https://github.com/relaypro/relay-js/blob/b16ef5f/src/uri.ts#L97)


<a name="modulesutilsmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / utils

## Module: utils

### Table of contents

#### Functions

- [arrayMapper](#arraymapper)
- [booleanMapper](#booleanmapper)
- [filterInt](#filterint)
- [isMatch](#ismatch)
- [isPlainObject](#isplainobject)
- [makeId](#makeid)
- [mapDevice](#mapdevice)
- [noop](#noop)
- [numberArrayMapper](#numberarraymapper)
- [toString](#tostring)

### Functions

#### arrayMapper

▸ **arrayMapper**(`value`): `string`[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

##### Returns

`string`[]

##### Defined in

[utils.ts:44](https://github.com/relaypro/relay-js/blob/b16ef5f/src/utils.ts#L44)

___

#### booleanMapper

▸ **booleanMapper**(`value`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

##### Returns

`boolean`

##### Defined in

[utils.ts:46](https://github.com/relaypro/relay-js/blob/b16ef5f/src/utils.ts#L46)

___

#### filterInt

▸ **filterInt**(`value`): `number`

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

##### Returns

`number`

##### Defined in

[utils.ts:36](https://github.com/relaypro/relay-js/blob/b16ef5f/src/utils.ts#L36)

___

#### isMatch

▸ **isMatch**(`object`, `source`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `object` | `any` |
| `source` | `any` |

##### Returns

`boolean`

##### Defined in

[utils.ts:86](https://github.com/relaypro/relay-js/blob/b16ef5f/src/utils.ts#L86)

___

#### isPlainObject

▸ **isPlainObject**<`Value`\>(`value`): value is Record<string \| number \| symbol, Value\>

##### Type parameters

| Name |
| :------ |
| `Value` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `unknown` |

##### Returns

value is Record<string \| number \| symbol, Value\>

##### Defined in

[utils.ts:72](https://github.com/relaypro/relay-js/blob/b16ef5f/src/utils.ts#L72)

___

#### makeId

▸ **makeId**(): `string`

##### Returns

`string`

##### Defined in

[utils.ts:32](https://github.com/relaypro/relay-js/blob/b16ef5f/src/utils.ts#L32)

___

#### mapDevice

▸ **mapDevice**(`device`): [`Device`](#device)

##### Parameters

| Name | Type |
| :------ | :------ |
| `device` | `Record`<`string`, `any`\> |

##### Returns

[`Device`](#device)

##### Defined in

[utils.ts:99](https://github.com/relaypro/relay-js/blob/b16ef5f/src/utils.ts#L99)

___

#### noop

▸ **noop**(): `void`

##### Returns

`void`

##### Defined in

[utils.ts:30](https://github.com/relaypro/relay-js/blob/b16ef5f/src/utils.ts#L30)

___

#### numberArrayMapper

▸ **numberArrayMapper**(`value`): `number`[]

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

##### Returns

`number`[]

##### Defined in

[utils.ts:45](https://github.com/relaypro/relay-js/blob/b16ef5f/src/utils.ts#L45)

___

#### toString

▸ **toString**(`value`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`AnyPrimitive`](#anyprimitive) |

##### Returns

`string`

##### Defined in

[utils.ts:48](https://github.com/relaypro/relay-js/blob/b16ef5f/src/utils.ts#L48)


<a name="modulesvarsmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / vars

## Module: vars

### Table of contents

#### Variables

- [vars](#vars)

### Variables

#### vars

• `Const` **vars**: `Vars`

##### Defined in

[vars.ts:73](https://github.com/relaypro/relay-js/blob/b16ef5f/src/vars.ts#L73)
