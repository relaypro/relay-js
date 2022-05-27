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
    - [Enumeration members](#enumeration-members)
  - [Enumeration: CallDirection](#enumeration-calldirection)
    - [Table of contents](#table-of-contents-3)
    - [Enumeration members](#enumeration-members-1)
  - [Enumeration: DeviceInfoField](#enumeration-deviceinfofield)
    - [Table of contents](#table-of-contents-4)
    - [Enumeration members](#enumeration-members-2)
  - [Enumeration: DeviceInfoQuery](#enumeration-deviceinfoquery)
    - [Table of contents](#table-of-contents-5)
    - [Enumeration members](#enumeration-members-3)
  - [Enumeration: DeviceType](#enumeration-devicetype)
    - [Table of contents](#table-of-contents-6)
    - [Enumeration members](#enumeration-members-4)
  - [Enumeration: Event](#enumeration-event)
    - [Table of contents](#table-of-contents-7)
    - [Enumeration members](#enumeration-members-5)
  - [Enumeration: IncidentStatus](#enumeration-incidentstatus)
    - [Table of contents](#table-of-contents-8)
    - [Enumeration members](#enumeration-members-6)
  - [Enumeration: Language](#enumeration-language)
    - [Table of contents](#table-of-contents-9)
    - [Enumeration members](#enumeration-members-7)
  - [Enumeration: Notification](#enumeration-notification)
    - [Table of contents](#table-of-contents-10)
    - [Enumeration members](#enumeration-members-8)
  - [Enumeration: NotificationPriority](#enumeration-notificationpriority)
    - [Table of contents](#table-of-contents-11)
    - [Enumeration members](#enumeration-members-9)
  - [Enumeration: NotificationSound](#enumeration-notificationsound)
    - [Table of contents](#table-of-contents-12)
    - [Enumeration members](#enumeration-members-10)
  - [Enumeration: Taps](#enumeration-taps)
    - [Table of contents](#table-of-contents-13)
    - [Enumeration members](#enumeration-members-11)
  - [Enumeration: TimeoutType](#enumeration-timeouttype)
    - [Table of contents](#table-of-contents-14)
    - [Enumeration members](#enumeration-members-12)
  - [Enumeration: TimerType](#enumeration-timertype)
    - [Table of contents](#table-of-contents-15)
    - [Enumeration members](#enumeration-members-13)
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
    - [Type aliases](#type-aliases)
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

relay-js SDK is a node.js library for interacting with Relay. For full documentation visit [api-docs.relaypro.com](https://api-docs.relaypro.com)

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
* An __interaction__ is started. This creates a temporary channel on the Relay device, which provides a sort of "context" in which
  some device-specific commands are sent.
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

* [Relay](classes/relayeventadapter.md)

## Workflow Registration

More thorough documentation on how to register your workflow on a Relay device
can be found at https://api-docs.relaypro.com/docs/register-workflows

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

[api.ts:168](https://github.com/relaypro/relay-js/blob/5b08a30/src/api.ts#L168)

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

[api.ts:174](https://github.com/relaypro/relay-js/blob/5b08a30/src/api.ts#L174)


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

[index.ts:410](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L410)

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

[index.ts:555](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L555)

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

[index.ts:370](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L370)

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

[index.ts:394](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L394)

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

[index.ts:414](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L414)

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

[index.ts:398](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L398)

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

[index.ts:406](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L406)

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

[index.ts:593](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L593)

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

[index.ts:735](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L735)

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

[index.ts:382](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L382)

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

[index.ts:505](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L505)

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

[index.ts:378](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L378)

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

[index.ts:501](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L501)

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

[index.ts:366](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L366)

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

[index.ts:709](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L709)

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

[index.ts:701](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L701)

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

[index.ts:463](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L463)

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

[index.ts:479](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L479)

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

[index.ts:467](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L467)

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

[index.ts:451](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L451)

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

[index.ts:475](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L475)

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

[index.ts:471](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L471)

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

[index.ts:455](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L455)

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

[index.ts:459](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L459)

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

[index.ts:446](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L446)

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

[index.ts:483](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L483)

___

#### getGroupMembers

▸ **getGroupMembers**(`groupName`): `Promise`<`string`[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `groupName` | `string` |

##### Returns

`Promise`<`string`[]\>

##### Defined in

[index.ts:604](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L604)

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

[index.ts:689](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L689)

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

[index.ts:705](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L705)

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

[index.ts:697](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L697)

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

[index.ts:571](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L571)

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

[index.ts:436](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L436)

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

[index.ts:680](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L680)

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

[index.ts:559](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L559)

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

[index.ts:374](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L374)

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

[index.ts:517](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L517)

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

[index.ts:613](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L613)

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

[index.ts:621](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L621)

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

[index.ts:402](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L402)

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

[index.ts:87](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L87)

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

[index.ts:82](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L82)

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

[index.ts:551](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L551)

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

[index.ts:321](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L321)

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

[index.ts:326](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L326)

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

[index.ts:576](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L576)

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

[index.ts:422](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L422)

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

[index.ts:358](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L358)

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

[index.ts:563](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L563)

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

[index.ts:740](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L740)

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

[index.ts:418](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L418)

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

[index.ts:362](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L362)

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

[index.ts:310](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L310)

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

[index.ts:315](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L315)

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

[index.ts:657](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L657)

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

[index.ts:513](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L513)

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

[index.ts:609](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L609)

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

[index.ts:496](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L496)

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

[index.ts:509](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L509)

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

[index.ts:491](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L491)

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

[index.ts:589](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L589)

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

[index.ts:441](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L441)

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

[index.ts:653](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L653)

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

[index.ts:306](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L306)

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

[index.ts:727](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L727)

___

#### stopTimer

▸ **stopTimer**(): `Promise`<`void`\>

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:731](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L731)

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

[index.ts:354](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L354)

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

[index.ts:350](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L350)

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

[index.ts:346](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L346)

___

#### terminate

▸ **terminate**(): `Promise`<`void`\>

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:744](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L744)

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

[index.ts:630](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L630)

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

[index.ts:641](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L641)

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

[index.ts:597](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L597)

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

[index.ts:567](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L567)

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

[index.ts:672](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L672)

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

[index.ts:668](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L668)

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

[index.ts:342](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L342)

# Enums


<a name="enumsenumsbuttonmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Button

## Enumeration: Button

[enums](#modulesenumsmd).Button

### Table of contents

#### Enumeration members

- [ACTION](#action)
- [CHANNEL](#channel)

### Enumeration members

#### ACTION

• **ACTION** = `"action"`

##### Defined in

[enums.ts:31](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L31)

___

#### CHANNEL

• **CHANNEL** = `"channel"`

##### Defined in

[enums.ts:32](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L32)


<a name="enumsenumscalldirectionmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / CallDirection

## Enumeration: CallDirection

[enums](#modulesenumsmd).CallDirection

### Table of contents

#### Enumeration members

- [INBOUND](#inbound)
- [OUTBOUND](#outbound)

### Enumeration members

#### INBOUND

• **INBOUND** = `"inbound"`

##### Defined in

[enums.ts:26](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L26)

___

#### OUTBOUND

• **OUTBOUND** = `"outbound"`

##### Defined in

[enums.ts:27](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L27)


<a name="enumsenumsdeviceinfofieldmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / DeviceInfoField

## Enumeration: DeviceInfoField

[enums](#modulesenumsmd).DeviceInfoField

### Table of contents

#### Enumeration members

- [CHANNEL](#channel)
- [LABEL](#label)
- [LOCATION\_ENABLED](#location_enabled)

### Enumeration members

#### CHANNEL

• **CHANNEL** = `"channel"`

##### Defined in

[enums.ts:95](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L95)

___

#### LABEL

• **LABEL** = `"label"`

##### Defined in

[enums.ts:94](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L94)

___

#### LOCATION\_ENABLED

• **LOCATION\_ENABLED** = `"location_enabled"`

##### Defined in

[enums.ts:96](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L96)


<a name="enumsenumsdeviceinfoquerymd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / DeviceInfoQuery

## Enumeration: DeviceInfoQuery

[enums](#modulesenumsmd).DeviceInfoQuery

### Table of contents

#### Enumeration members

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

### Enumeration members

#### ADDRESS

• **ADDRESS** = `"address"`

##### Defined in

[enums.ts:84](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L84)

___

#### BATTERY

• **BATTERY** = `"battery"`

##### Defined in

[enums.ts:86](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L86)

___

#### COORDINATES

• **COORDINATES** = `"latlong"`

##### Defined in

[enums.ts:85](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L85)

___

#### ID

• **ID** = `"id"`

##### Defined in

[enums.ts:82](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L82)

___

#### INDOOR\_LOCATION

• **INDOOR\_LOCATION** = `"indoor_location"`

##### Defined in

[enums.ts:87](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L87)

___

#### LOCATION

• **LOCATION** = `"location"`

##### Defined in

[enums.ts:88](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L88)

___

#### LOCATION\_ENABLED

• **LOCATION\_ENABLED** = `"location_enabled"`

##### Defined in

[enums.ts:90](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L90)

___

#### NAME

• **NAME** = `"name"`

##### Defined in

[enums.ts:81](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L81)

___

#### TYPE

• **TYPE** = `"type"`

##### Defined in

[enums.ts:83](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L83)

___

#### USERNAME

• **USERNAME** = `"username"`

##### Defined in

[enums.ts:89](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L89)


<a name="enumsenumsdevicetypemd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / DeviceType

## Enumeration: DeviceType

[enums](#modulesenumsmd).DeviceType

### Table of contents

#### Enumeration members

- [DASH](#dash)
- [RELAY](#relay)
- [RELAY2](#relay2)
- [RELAY\_APP](#relay_app)
- [ROIP](#roip)

### Enumeration members

#### DASH

• **DASH** = `"dash"`

##### Defined in

[enums.ts:104](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L104)

___

#### RELAY

• **RELAY** = `"relay"`

##### Defined in

[enums.ts:100](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L100)

___

#### RELAY2

• **RELAY2** = `"relay2"`

##### Defined in

[enums.ts:101](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L101)

___

#### RELAY\_APP

• **RELAY\_APP** = `"relay_app"`

##### Defined in

[enums.ts:102](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L102)

___

#### ROIP

• **ROIP** = `"roip"`

##### Defined in

[enums.ts:103](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L103)


<a name="enumsenumseventmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Event

## Enumeration: Event

[enums](#modulesenumsmd).Event

### Table of contents

#### Enumeration members

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

### Enumeration members

#### BUTTON

• **BUTTON** = `"button"`

##### Defined in

[enums.ts:11](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L11)

___

#### CALL\_CONNECTED

• **CALL\_CONNECTED** = `"call_connected"`

##### Defined in

[enums.ts:18](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L18)

___

#### CALL\_DISCONNECTED

• **CALL\_DISCONNECTED** = `"call_disconnected"`

##### Defined in

[enums.ts:19](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L19)

___

#### CALL\_FAILED

• **CALL\_FAILED** = `"call_failed"`

##### Defined in

[enums.ts:20](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L20)

___

#### CALL\_RECEIVED

• **CALL\_RECEIVED** = `"call_received"`

##### Defined in

[enums.ts:21](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L21)

___

#### CALL\_RINGING

• **CALL\_RINGING** = `"call_ringing"`

##### Defined in

[enums.ts:17](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L17)

___

#### CALL\_START\_REQUEST

• **CALL\_START\_REQUEST** = `"call_start_request"`

##### Defined in

[enums.ts:22](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L22)

___

#### ERROR

• **ERROR** = `"error"`

##### Defined in

[enums.ts:2](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L2)

___

#### INCIDENT

• **INCIDENT** = `"incident"`

##### Defined in

[enums.ts:14](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L14)

___

#### INTERACTION\_ENDED

• **INTERACTION\_ENDED** = `"interaction_ended"`

##### Defined in

[enums.ts:9](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L9)

___

#### INTERACTION\_FAILED

• **INTERACTION\_FAILED** = `"interaction_failed"`

##### Defined in

[enums.ts:10](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L10)

___

#### INTERACTION\_LIFECYCLE

• **INTERACTION\_LIFECYCLE** = `"interaction_lifecycle"`

##### Defined in

[enums.ts:5](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L5)

___

#### INTERACTION\_RESUMED

• **INTERACTION\_RESUMED** = `"interaction_resumed"`

##### Defined in

[enums.ts:7](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L7)

___

#### INTERACTION\_STARTED

• **INTERACTION\_STARTED** = `"interaction_started"`

##### Defined in

[enums.ts:6](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L6)

___

#### INTERACTION\_SUSPENDED

• **INTERACTION\_SUSPENDED** = `"interaction_suspended"`

##### Defined in

[enums.ts:8](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L8)

___

#### NOTIFICATION

• **NOTIFICATION** = `"notification"`

##### Defined in

[enums.ts:13](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L13)

___

#### PROMPT

• **PROMPT** = `"prompt"`

##### Defined in

[enums.ts:15](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L15)

___

#### SPEECH

• **SPEECH** = `"speech"`

##### Defined in

[enums.ts:16](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L16)

___

#### START

• **START** = `"start"`

##### Defined in

[enums.ts:3](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L3)

___

#### STOP

• **STOP** = `"stop"`

##### Defined in

[enums.ts:4](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L4)

___

#### TIMER

• **TIMER** = `"timer"`

##### Defined in

[enums.ts:12](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L12)


<a name="enumsenumsincidentstatusmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / IncidentStatus

## Enumeration: IncidentStatus

[enums](#modulesenumsmd).IncidentStatus

### Table of contents

#### Enumeration members

- [CANCELLED](#cancelled)
- [RESOLVED](#resolved)

### Enumeration members

#### CANCELLED

• **CANCELLED** = `"cancelled"`

##### Defined in

[enums.ts:116](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L116)

___

#### RESOLVED

• **RESOLVED** = `"resolved"`

##### Defined in

[enums.ts:115](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L115)


<a name="enumsenumslanguagemd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Language

## Enumeration: Language

[enums](#modulesenumsmd).Language

### Table of contents

#### Enumeration members

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

### Enumeration members

#### ARABIC

• **ARABIC** = `"ar"`

##### Defined in

[enums.ts:60](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L60)

___

#### BENGALI

• **BENGALI** = `"bn-IN"`

##### Defined in

[enums.ts:74](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L74)

___

#### CHINESE

• **CHINESE** = `"zh"`

##### Defined in

[enums.ts:59](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L59)

___

#### CZECH

• **CZECH** = `"cs-CZ"`

##### Defined in

[enums.ts:65](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L65)

___

#### DANISH

• **DANISH** = `"da-DK"`

##### Defined in

[enums.ts:64](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L64)

___

#### DUTCH

• **DUTCH** = `"nl-NL"`

##### Defined in

[enums.ts:58](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L58)

___

#### ENGLISH

• **ENGLISH** = `"en-US"`

##### Defined in

[enums.ts:43](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L43)

___

#### FILIPINO

• **FILIPINO** = `"fil-PH"`

##### Defined in

[enums.ts:63](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L63)

___

#### FINNISH

• **FINNISH** = `"fi-FI"`

##### Defined in

[enums.ts:77](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L77)

___

#### FRENCH

• **FRENCH** = `"fr-FR"`

##### Defined in

[enums.ts:46](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L46)

___

#### GERMAN

• **GERMAN** = `"de-DE"`

##### Defined in

[enums.ts:44](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L44)

___

#### GREEK

• **GREEK** = `"el-GR"`

##### Defined in

[enums.ts:75](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L75)

___

#### GUJURATI

• **GUJURATI** = `"gu-IN"`

##### Defined in

[enums.ts:66](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L66)

___

#### HINDI

• **HINDI** = `"hi-IN"`

##### Defined in

[enums.ts:51](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L51)

___

#### HUNGARIAN

• **HUNGARIAN** = `"hu-HU"`

##### Defined in

[enums.ts:67](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L67)

___

#### ICELANDIC

• **ICELANDIC** = `"is-IS"`

##### Defined in

[enums.ts:52](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L52)

___

#### INDONESIAN

• **INDONESIAN** = `"id-ID"`

##### Defined in

[enums.ts:62](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L62)

___

#### ITALIAN

• **ITALIAN** = `"it-IT"`

##### Defined in

[enums.ts:47](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L47)

___

#### JAPANESE

• **JAPANESE** = `"ja-JP"`

##### Defined in

[enums.ts:53](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L53)

___

#### KANNADA

• **KANNADA** = `"kn-IN"`

##### Defined in

[enums.ts:76](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L76)

___

#### KOREAN

• **KOREAN** = `"ko-KR"`

##### Defined in

[enums.ts:54](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L54)

___

#### MALAY

• **MALAY** = `"ms-MY"`

##### Defined in

[enums.ts:73](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L73)

___

#### NORWEGIAN

• **NORWEGIAN** = `"nb-NO"`

##### Defined in

[enums.ts:57](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L57)

___

#### POLISH

• **POLISH** = `"pl-PK"`

##### Defined in

[enums.ts:55](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L55)

___

#### PORTUGUESE

• **PORTUGUESE** = `"pt-BR"`

##### Defined in

[enums.ts:56](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L56)

___

#### PUNJABI

• **PUNJABI** = `"pa-IN"`

##### Defined in

[enums.ts:72](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L72)

___

#### ROMANIAN

• **ROMANIAN** = `"ro-RO"`

##### Defined in

[enums.ts:71](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L71)

___

#### RUSSIAN

• **RUSSIAN** = `"ru-RU"`

##### Defined in

[enums.ts:48](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L48)

___

#### SLOVAK

• **SLOVAK** = `"sk-SK"`

##### Defined in

[enums.ts:70](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L70)

___

#### SPANISH

• **SPANISH** = `"es-ES"`

##### Defined in

[enums.ts:45](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L45)

___

#### SWEDISH

• **SWEDISH** = `"sv-SE"`

##### Defined in

[enums.ts:49](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L49)

___

#### TAMIL

• **TAMIL** = `"ta-IN"`

##### Defined in

[enums.ts:68](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L68)

___

#### TURKISH

• **TURKISH** = `"tr-TR"`

##### Defined in

[enums.ts:50](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L50)

___

#### UKRANIAN

• **UKRANIAN** = `"uk-UA"`

##### Defined in

[enums.ts:69](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L69)

___

#### VIETNAMESE

• **VIETNAMESE** = `"vi-VN"`

##### Defined in

[enums.ts:61](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L61)


<a name="enumsenumsnotificationmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Notification

## Enumeration: Notification

[enums](#modulesenumsmd).Notification

### Table of contents

#### Enumeration members

- [ALERT](#alert)
- [BROADCAST](#broadcast)
- [CANCEL](#cancel)
- [NOTIFY](#notify)

### Enumeration members

#### ALERT

• **ALERT** = `"alert"`

##### Defined in

[enums.ts:109](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L109)

___

#### BROADCAST

• **BROADCAST** = `"broadcast"`

##### Defined in

[enums.ts:108](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L108)

___

#### CANCEL

• **CANCEL** = `"cancel"`

##### Defined in

[enums.ts:111](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L111)

___

#### NOTIFY

• **NOTIFY** = `"notify"`

##### Defined in

[enums.ts:110](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L110)


<a name="enumsenumsnotificationprioritymd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / NotificationPriority

## Enumeration: NotificationPriority

[enums](#modulesenumsmd).NotificationPriority

### Table of contents

#### Enumeration members

- [CRITICAL](#critical)
- [HIGH](#high)
- [NORMAL](#normal)

### Enumeration members

#### CRITICAL

• **CRITICAL** = `"critical"`

##### Defined in

[enums.ts:122](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L122)

___

#### HIGH

• **HIGH** = `"high"`

##### Defined in

[enums.ts:121](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L121)

___

#### NORMAL

• **NORMAL** = `"normal"`

##### Defined in

[enums.ts:120](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L120)


<a name="enumsenumsnotificationsoundmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / NotificationSound

## Enumeration: NotificationSound

[enums](#modulesenumsmd).NotificationSound

### Table of contents

#### Enumeration members

- [DEFAULT](#default)
- [SOS](#sos)

### Enumeration members

#### DEFAULT

• **DEFAULT** = `"default"`

##### Defined in

[enums.ts:126](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L126)

___

#### SOS

• **SOS** = `"sos"`

##### Defined in

[enums.ts:127](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L127)


<a name="enumsenumstapsmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Taps

## Enumeration: Taps

[enums](#modulesenumsmd).Taps

### Table of contents

#### Enumeration members

- [DOUBLE](#double)
- [LONG](#long)
- [SINGLE](#single)
- [TRIPLE](#triple)

### Enumeration members

#### DOUBLE

• **DOUBLE** = `"double"`

##### Defined in

[enums.ts:37](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L37)

___

#### LONG

• **LONG** = `"long"`

##### Defined in

[enums.ts:39](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L39)

___

#### SINGLE

• **SINGLE** = `"single"`

##### Defined in

[enums.ts:36](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L36)

___

#### TRIPLE

• **TRIPLE** = `"triple"`

##### Defined in

[enums.ts:38](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L38)


<a name="enumsenumstimeouttypemd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / TimeoutType

## Enumeration: TimeoutType

[enums](#modulesenumsmd).TimeoutType

### Table of contents

#### Enumeration members

- [HOURS](#hours)
- [MILLISECONDS](#milliseconds)
- [MINUTES](#minutes)
- [SECONDS](#seconds)

### Enumeration members

#### HOURS

• **HOURS** = `"hrs"`

##### Defined in

[enums.ts:139](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L139)

___

#### MILLISECONDS

• **MILLISECONDS** = `"ms"`

##### Defined in

[enums.ts:136](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L136)

___

#### MINUTES

• **MINUTES** = `"mins"`

##### Defined in

[enums.ts:138](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L138)

___

#### SECONDS

• **SECONDS** = `"secs"`

##### Defined in

[enums.ts:137](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L137)


<a name="enumsenumstimertypemd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / TimerType

## Enumeration: TimerType

[enums](#modulesenumsmd).TimerType

### Table of contents

#### Enumeration members

- [INTERVAL](#interval)
- [TIMEOUT](#timeout)

### Enumeration members

#### INTERVAL

• **INTERVAL** = `"interval"`

##### Defined in

[enums.ts:132](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L132)

___

#### TIMEOUT

• **TIMEOUT** = `"timeout"`

##### Defined in

[enums.ts:131](https://github.com/relaypro/relay-js/blob/5b08a30/src/enums.ts#L131)

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

[types.ts:41](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L41)

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

[types.ts:40](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L40)


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

[types.ts:36](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L36)


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

[constants.ts:9](https://github.com/relaypro/relay-js/blob/5b08a30/src/constants.ts#L9)

___

#### EVENT\_TIMEOUT

• `Const` **EVENT\_TIMEOUT**: ``32000``

##### Defined in

[constants.ts:5](https://github.com/relaypro/relay-js/blob/5b08a30/src/constants.ts#L5)

___

#### HEARTBEAT

• `Const` **HEARTBEAT**: `number`

##### Defined in

[constants.ts:2](https://github.com/relaypro/relay-js/blob/5b08a30/src/constants.ts#L2)

___

#### NON\_INTERACTIVE\_ACTIONS

• `Const` **NON\_INTERACTIVE\_ACTIONS**: `string`[]

##### Defined in

[constants.ts:13](https://github.com/relaypro/relay-js/blob/5b08a30/src/constants.ts#L13)

___

#### NOTIFICATION\_TIMEOUT

• `Const` **NOTIFICATION\_TIMEOUT**: ``60000``

##### Defined in

[constants.ts:7](https://github.com/relaypro/relay-js/blob/5b08a30/src/constants.ts#L7)

___

#### PORT

• `Const` **PORT**: `number`

##### Defined in

[constants.ts:1](https://github.com/relaypro/relay-js/blob/5b08a30/src/constants.ts#L1)

___

#### PROGRESS\_EVENT

• `Const` **PROGRESS\_EVENT**: ``"wf_api_progress_event"``

##### Defined in

[constants.ts:10](https://github.com/relaypro/relay-js/blob/5b08a30/src/constants.ts#L10)

___

#### REFRESH\_TIMEOUT

• `Const` **REFRESH\_TIMEOUT**: ``45000``

##### Defined in

[constants.ts:6](https://github.com/relaypro/relay-js/blob/5b08a30/src/constants.ts#L6)

___

#### TIMEOUT

• `Const` **TIMEOUT**: ``5000``

##### Defined in

[constants.ts:4](https://github.com/relaypro/relay-js/blob/5b08a30/src/constants.ts#L4)


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
- [relay](#relay)

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

[index.ts:50](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L50)

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

[index.ts:757](https://github.com/relaypro/relay-js/blob/5b08a30/src/index.ts#L757)


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

#### Type aliases

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

### Type aliases

#### AnyEvent

Ƭ **AnyEvent**: `Error`

##### Defined in

[types.ts:194](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L194)

___

#### AnyPrimitive

Ƭ **AnyPrimitive**: `undefined` \| `symbol` \| `string` \| `boolean` \| `number` \| [`string` \| `boolean` \| `number`]

##### Defined in

[types.ts:230](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L230)

___

#### AudioResponse

Ƭ **AudioResponse**: `Record`<``"audio"``, `string`\>

##### Defined in

[types.ts:226](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L226)

___

#### BaseCallEvent

Ƭ **BaseCallEvent**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `call_id` | `string` |

##### Defined in

[types.ts:279](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L279)

___

#### ButtonEvent

Ƭ **ButtonEvent**: [`Event`](#event) & { `button`: [`Button`](#enumsenumsbuttonmd) ; `taps`: [`Taps`](#enumsenumstapsmd)  }

##### Defined in

[types.ts:165](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L165)

___

#### ButtonTrigger

Ƭ **ButtonTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) & { `action`: ``"action_button_single_tap"`` \| ``"action_button_double_tap"`` \| ``"action_button_triple_tap"``  } |
| `type` | ``"button"`` |

##### Defined in

[types.ts:98](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L98)

___

#### Call

Ƭ **Call**: [`StartedCallEvent`](#startedcallevent) \| [`ReceivedCallEvent`](#receivedcallevent) \| [`ConnectedCallEvent`](#connectedcallevent) \| [`DisconnectedCallEvent`](#disconnectedcallevent) \| [`FailedCallEvent`](#failedcallevent)

##### Defined in

[types.ts:301](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L301)

___

#### ConnectedCallEvent

Ƭ **ConnectedCallEvent**: [`ReceivedCallEvent`](#receivedcallevent) & { `connect_time_epoch`: `number`  }

##### Defined in

[types.ts:293](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L293)

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

[types.ts:307](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L307)

___

#### DisconnectedCallEvent

Ƭ **DisconnectedCallEvent**: [`ConnectedCallEvent`](#connectedcallevent) & { `end_time_epoch`: `number` ; `reason`: `string`  }

##### Defined in

[types.ts:296](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L296)

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

[types.ts:153](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L153)

___

#### Event

Ƭ **Event**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `source_uri` | `string` |

##### Defined in

[types.ts:145](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L145)

___

#### FailedCallEvent

Ƭ **FailedCallEvent**: [`DisconnectedCallEvent`](#disconnectedcallevent)

##### Defined in

[types.ts:300](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L300)

___

#### HomeChannelBehavior

Ƭ **HomeChannelBehavior**: ``"suspend"`` \| ``"normal"``

##### Defined in

[types.ts:217](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L217)

___

#### HttpTrigger

Ƭ **HttpTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) & { `args`: `Record`<`string`, `string`\>  } |
| `type` | ``"http"`` |

##### Defined in

[types.ts:105](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L105)

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

[types.ts:196](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L196)

___

#### InputType

Ƭ **InputType**: ``"action_button_single_tap"`` \| ``"action_button_double_tap"`` \| ``"action_button_triple_tap"`` \| ``"action_button_long_press"`` \| ``"channel_button_double_tap"`` \| ``"channel_button_triple_tap"``

##### Defined in

[types.ts:210](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L210)

___

#### InteractionLifecycle

Ƭ **InteractionLifecycle**: ``"started"`` \| ``"resumed"`` \| ``"suspended"`` \| ``"ended"`` \| ``"failed"``

##### Defined in

[types.ts:139](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L139)

___

#### InteractionLifecycleEvent

Ƭ **InteractionLifecycleEvent**: [`Event`](#event) & { `reason?`: `string` ; `type`: `string`  }

##### Defined in

[types.ts:132](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L132)

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

[types.ts:219](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L219)

___

#### LedEffect

Ƭ **LedEffect**: ``"off"`` \| ``"breathe"`` \| ``"flash"`` \| ``"rotate"`` \| ``"rainbow"`` \| ``"static"``

##### Defined in

[types.ts:237](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L237)

___

#### LedIndex

Ƭ **LedIndex**: ``"ring"`` \| ``1`` \| ``2`` \| ``3`` \| ``4`` \| ``5`` \| ``6`` \| ``7`` \| ``8`` \| ``9`` \| ``10`` \| ``11`` \| ``12`` \| ``13`` \| ``14`` \| ``15`` \| ``16`` \| ``"1"`` \| ``"2"`` \| ``"3"`` \| ``"4"`` \| ``"5"`` \| ``"6"`` \| ``"7"`` \| ``"8"`` \| ``"9"`` \| ``"10"`` \| ``"11"`` \| ``"12"`` \| ``"13"`` \| ``"14"`` \| ``"15"`` \| ``"16"``

##### Defined in

[types.ts:236](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L236)

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

[types.ts:238](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L238)

___

#### ListenResponse

Ƭ **ListenResponse**: [`TranscriptionResponse`](#transcriptionresponse) \| [`AudioResponse`](#audioresponse)

##### Defined in

[types.ts:228](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L228)

___

#### LocalWebSocket

Ƭ **LocalWebSocket**: `WebSocket` & { `connectionId`: `string` ; `isAlive`: `boolean`  }

##### Defined in

[types.ts:30](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L30)

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

[types.ts:232](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L232)

___

#### Maybe

Ƭ **Maybe**<`T`\>: `T` \| ``null`` \| `undefined`

##### Type parameters

| Name |
| :------ |
| `T` |

##### Defined in

[types.ts:18](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L18)

___

#### NfcTrigger

Ƭ **NfcTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) & { `nfc_payload`: `Record`<`string`, `string`\> ; `uid`: `string`  } |
| `type` | ``"nfc"`` |

##### Defined in

[types.ts:112](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L112)

___

#### NotificationEvent

Ƭ **NotificationEvent**: [`Event`](#event) & { `event`: `string` ; `name`: `string` ; `notification_state`: [`NotificationState`](#notificationstate)  }

##### Defined in

[types.ts:172](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L172)

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

[types.ts:253](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L253)

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

[types.ts:260](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L260)

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

[types.ts:24](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L24)

___

#### OtherTrigger

Ƭ **OtherTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) |
| `type` | ``"emergency"`` \| ``"other"`` \| ``"calendar"`` \| ``"geofence"`` \| ``"telephony"`` |

##### Defined in

[types.ts:121](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L121)

___

#### PhraseTrigger

Ƭ **PhraseTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) & { `phrase`: `string` ; `spillover`: `string`  } |
| `type` | ``"phrase"`` |

##### Defined in

[types.ts:90](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L90)

___

#### PlaceCall

Ƭ **PlaceCall**: `Partial`<`Omit`<[`StartedCallEvent`](#startedcallevent), ``"call_id"``\>\>

##### Defined in

[types.ts:285](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L285)

___

#### ProgressingCallEvent

Ƭ **ProgressingCallEvent**: [`ReceivedCallEvent`](#receivedcallevent)

##### Defined in

[types.ts:292](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L292)

___

#### PromptEvent

Ƭ **PromptEvent**: [`Event`](#event) & { `id`: `string` ; `type`: `string`  }

##### Defined in

[types.ts:187](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L187)

___

#### RawWorkflowEvent

Ƭ **RawWorkflowEvent**: [`UnionToIntersection`](#uniontointersection)<`WorkflowEvent`\> & { `_id`: `string` ; `_type`: `string`  }

##### Defined in

[types.ts:73](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L73)

___

#### ReceivedCallEvent

Ƭ **ReceivedCallEvent**: [`StartedCallEvent`](#startedcallevent) & { `direction`: [`CallDirection`](#enumsenumscalldirectionmd) ; `onnet`: `boolean` ; `start_time_epoch`: `number`  }

##### Defined in

[types.ts:286](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L286)

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

[types.ts:271](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L271)

___

#### RingingCallEvent

Ƭ **RingingCallEvent**: [`ReceivedCallEvent`](#receivedcallevent)

##### Defined in

[types.ts:291](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L291)

___

#### SingleTarget

Ƭ **SingleTarget**: `string`

##### Defined in

[types.ts:205](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L205)

___

#### SpeechEvent

Ƭ **SpeechEvent**: [`Event`](#event) & { `audio`: `string` ; `lang`: `string` ; `request_id`: `string` ; `text`: `string`  }

##### Defined in

[types.ts:178](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L178)

___

#### StartEvent

Ƭ **StartEvent**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `trigger` | [`PhraseTrigger`](#phrasetrigger) \| [`ButtonTrigger`](#buttontrigger) \| [`HttpTrigger`](#httptrigger) \| [`NfcTrigger`](#nfctrigger) \| [`OtherTrigger`](#othertrigger) |

##### Defined in

[types.ts:157](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L157)

___

#### StartedCallEvent

Ƭ **StartedCallEvent**: [`BaseCallEvent`](#basecallevent) & { `uri`: `string`  }

##### Defined in

[types.ts:282](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L282)

___

#### StopEvent

Ƭ **StopEvent**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `reason` | ``"error"`` \| ``"normal"`` \| `string` |

##### Defined in

[types.ts:161](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L161)

___

#### Target

Ƭ **Target**: [`SingleTarget`](#singletarget) \| `string`[]

##### Defined in

[types.ts:206](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L206)

___

#### TargetUris

Ƭ **TargetUris**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `uris` | `string`[] |

##### Defined in

[types.ts:207](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L207)

___

#### TimerEvent

Ƭ **TimerEvent**: `Record`<``"name"``, `string`\>

##### Defined in

[types.ts:170](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L170)

___

#### TrackEventParameters

Ƭ **TrackEventParameters**: `Record`<`string`, `Record`<`string`, `string` \| `number` \| `boolean`\>\>

##### Defined in

[types.ts:305](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L305)

___

#### TranscriptionResponse

Ƭ **TranscriptionResponse**: `Record`<``"text"`` \| ``"lang"``, `string`\>

##### Defined in

[types.ts:225](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L225)

___

#### TriggerArgs

Ƭ **TriggerArgs**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `source_uri` | `string` |

##### Defined in

[types.ts:86](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L86)

___

#### UnionToIntersection

Ƭ **UnionToIntersection**<`T`\>: `T` extends `any` ? (`x`: `T`) => `any` : `never` extends (`x`: infer R) => `any` ? `R` : `never`

##### Type parameters

| Name |
| :------ |
| `T` |

##### Defined in

[types.ts:22](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L22)

___

#### UnregisterRequest

Ƭ **UnregisterRequest**: `Omit`<[`RegisterRequest`](#registerrequest), ``"expires"``\>

##### Defined in

[types.ts:277](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L277)

___

#### ValueOf

Ƭ **ValueOf**<`T`\>: `T`[keyof `T`]

##### Type parameters

| Name |
| :------ |
| `T` |

##### Defined in

[types.ts:20](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L20)

___

#### WorkflowEventHandlers

Ƭ **WorkflowEventHandlers**: { [EventName in keyof WorkflowEventMappings]?: Function }

##### Defined in

[types.ts:78](https://github.com/relaypro/relay-js/blob/5b08a30/src/types.ts#L78)


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
- [parseDeviceName](#parsedevicename)
- [parseGroupName](#parsegroupname)

### Functions

#### allDevices

▸ **allDevices**(): `string`

##### Returns

`string`

##### Defined in

[uri.ts:98](https://github.com/relaypro/relay-js/blob/5b08a30/src/uri.ts#L98)

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

[uri.ts:91](https://github.com/relaypro/relay-js/blob/5b08a30/src/uri.ts#L91)

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

[uri.ts:102](https://github.com/relaypro/relay-js/blob/5b08a30/src/uri.ts#L102)

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

[uri.ts:88](https://github.com/relaypro/relay-js/blob/5b08a30/src/uri.ts#L88)

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

[uri.ts:89](https://github.com/relaypro/relay-js/blob/5b08a30/src/uri.ts#L89)

___

#### genericOriginator

▸ **genericOriginator**(): `string`

##### Returns

`string`

##### Defined in

[uri.ts:100](https://github.com/relaypro/relay-js/blob/5b08a30/src/uri.ts#L100)

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

[uri.ts:84](https://github.com/relaypro/relay-js/blob/5b08a30/src/uri.ts#L84)

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

[uri.ts:86](https://github.com/relaypro/relay-js/blob/5b08a30/src/uri.ts#L86)

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

[uri.ts:85](https://github.com/relaypro/relay-js/blob/5b08a30/src/uri.ts#L85)

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

[uri.ts:121](https://github.com/relaypro/relay-js/blob/5b08a30/src/uri.ts#L121)

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

[uri.ts:125](https://github.com/relaypro/relay-js/blob/5b08a30/src/uri.ts#L125)

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

[uri.ts:111](https://github.com/relaypro/relay-js/blob/5b08a30/src/uri.ts#L111)

___

#### parseDeviceName

▸ **parseDeviceName**(`uri`): `undefined` \| `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |

##### Returns

`undefined` \| `string`

##### Defined in

[uri.ts:59](https://github.com/relaypro/relay-js/blob/5b08a30/src/uri.ts#L59)

___

#### parseGroupName

▸ **parseGroupName**(`uri`): `undefined` \| `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |

##### Returns

`undefined` \| `string`

##### Defined in

[uri.ts:75](https://github.com/relaypro/relay-js/blob/5b08a30/src/uri.ts#L75)


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

[utils.ts:42](https://github.com/relaypro/relay-js/blob/5b08a30/src/utils.ts#L42)

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

[utils.ts:44](https://github.com/relaypro/relay-js/blob/5b08a30/src/utils.ts#L44)

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

[utils.ts:34](https://github.com/relaypro/relay-js/blob/5b08a30/src/utils.ts#L34)

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

[utils.ts:84](https://github.com/relaypro/relay-js/blob/5b08a30/src/utils.ts#L84)

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

[utils.ts:70](https://github.com/relaypro/relay-js/blob/5b08a30/src/utils.ts#L70)

___

#### makeId

▸ **makeId**(): `string`

##### Returns

`string`

##### Defined in

[utils.ts:30](https://github.com/relaypro/relay-js/blob/5b08a30/src/utils.ts#L30)

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

[utils.ts:97](https://github.com/relaypro/relay-js/blob/5b08a30/src/utils.ts#L97)

___

#### noop

▸ **noop**(): `void`

##### Returns

`void`

##### Defined in

[utils.ts:28](https://github.com/relaypro/relay-js/blob/5b08a30/src/utils.ts#L28)

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

[utils.ts:43](https://github.com/relaypro/relay-js/blob/5b08a30/src/utils.ts#L43)

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

[utils.ts:46](https://github.com/relaypro/relay-js/blob/5b08a30/src/utils.ts#L46)


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

[vars.ts:71](https://github.com/relaypro/relay-js/blob/5b08a30/src/vars.ts#L71)
