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

[api.ts:170](https://github.com/relaypro/relay-js/blob/399deba/src/api.ts#L170)

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

[api.ts:176](https://github.com/relaypro/relay-js/blob/399deba/src/api.ts#L176)


<a name="classesindexworkflowmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [index](#modulesindexmd) / Workflow

## Class: Workflow

[index](#modulesindexmd).Workflow

The Workflow class is responsible for defining the main functionalities that are used within workflows,
such as functions for communicating with the device, sending out
notifications to groups, handling workflow events, and performing physical actions
on the device such as manipulating LEDs and creating vibrations.

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

Sends out an alert to the specified group of devices and the Relay Dash.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the group URN that you would like to send an alert to. |
| `originator` | `string` | the URN of the device that triggered the alert. |
| `name` | `string` | a name for your alert. |
| `text` | `string` | the text that you would like to be spokento the group as your alert. |
| `pushOptions?` | [`NotificationOptions`](#notificationoptions) | push options for if the alert is sent to the Relay app on a virtual device. Defaults to {}. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:580](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L580)

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

[index.ts:874](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L874)

___

#### breathe

▸ **breathe**(`target`, `color?`): `Promise`<`void`\>

Switches all of the LEDs on a device to a certain color and creates a 'breathing' effect,
where the LEDs will slowly light up a specified number of times.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the interaction URN. |
| `color` | `string` | the hex color code you would like to turn the LEDs to. Defaults to '0000FF'. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:475](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L475)

___

#### broadcast

▸ **broadcast**(`target`, `originator`, `name`, `text`, `pushOptions?`): `Promise`<`void`\>

Sends out a broadcasted message to a group of devices.  The message is played out on
all devices, as well as sent to the Relay Dash.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the group URN that you would like to broadcast your message to. |
| `originator` | `string` | the device URN that triggered the broadcast. |
| `name` | `string` | a name for your broadcast. |
| `text` | `string` | the text that you would like to be broadcasted to your group. |
| `pushOptions?` | [`NotificationOptions`](#notificationoptions) | push options for if the broadcast is sent to the Relay App on a virtual device.  Defaults to {}. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:538](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L538)

___

#### cancelAlert

▸ **cancelAlert**(`target`, `name`): `Promise`<`void`\>

Cancels an alert that was sent to a group of devices.  Particularly useful if you would like to cancel the alert
on all devices after one device has acknowledged the alert.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the device URN that has acknowledged the alert. |
| `name` | `string` | the name of the alert. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:590](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L590)

___

#### cancelBroadcast

▸ **cancelBroadcast**(`target`, `name`): `Promise`<`void`\>

Cancels the broadcast that was sent to a group of devices.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the device URN that is cancelling the broadcast. |
| `name` | `string` | the name of the broadcast that you would like to cancel. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:547](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L547)

___

#### cancelNotify

▸ **cancelNotify**(`target`, `name`): `Promise`<`void`\>

Cancels the notification that was sent to a group of devices.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the device URN that is cancelling the notification. |
| `name` | `string` | the name of the notification that you would like to cancel. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:568](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L568)

___

#### clearTimer

▸ **clearTimer**(`name`): `Promise`<`void`\>

Clears the specified timer.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | the name of the timer that you would like to clear. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:933](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L933)

___

#### createIncident

▸ **createIncident**(`originatorUri`, `type`): `Promise`<`string`\>

Creates an incident that will alert the Relay Dash.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `originatorUri` | `string` | the device URN that triggered the incident. |
| `type` | `string` | the type of incident that occurred. |

##### Returns

`Promise`<`string`\>

the incident ID.

##### Defined in

[index.ts:1202](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1202)

___

#### disableHomeChannel

▸ **disableHomeChannel**(`target`): `Promise`<`void`\>

Sets the home channel state on the device to false.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the device URN whose home channel you would like to set. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:502](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L502)

___

#### disableLocation

▸ **disableLocation**(`target`): `Promise`<`void`\>

Disables location services on a device.  Location services will remain
disabled until they are enabled on the Relay Dash or through a workflow.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:797](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L797)

___

#### enableHomeChannel

▸ **enableHomeChannel**(`target`): `Promise`<`void`\>

Sets the home channel state on the device to true.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the device URN whose home channel you would like to set. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:494](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L494)

___

#### enableLocation

▸ **enableLocation**(`target`): `Promise`<`void`\>

Enables location services on a device.  Location services will remain
enabled until they are disabled on the Relay Dash or through a workflow.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:788](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L788)

___

#### endInteraction

▸ **endInteraction**(`target`, `name`): `Promise`<`void`\>

Ends an interaction with the user.  Triggers an INTERACTION_ENDED event to signify
that the user is done interacting with the device.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the device that you would like to end an interaction with. |
| `name` | `string` | the name of the interaction that you would like to end. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:333](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L333)

___

#### flash

▸ **flash**(`target`, `color?`): `Promise`<`void`\>

Switches all of the LEDs on a device to a certain color and flashes them
a specified number of times.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the interaction URN. |
| `color` | `string` | the hex color code you would like to turn the LEDs to. Defaults to '0000FF'. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:465](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L465)

___

#### get

▸ **get**(`names`, `mappers`): `Promise`<[`AnyPrimitive`](#anyprimitive) \| [`AnyPrimitive`](#anyprimitive)[]\>

Helper method for retrieving variables.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `names` | `string` \| `string`[] | the name or names of the desired variables. |
| `mappers` | [[`Mapper`](#mapper)<[`AnyPrimitive`](#anyprimitive)\>] | mapper for the variable. |

##### Returns

`Promise`<[`AnyPrimitive`](#anyprimitive) \| [`AnyPrimitive`](#anyprimitive)[]\>

the variable/variables.

##### Defined in

[index.ts:1162](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1162)

___

#### getArrayVar

▸ **getArrayVar**(`name`, `defaultValue?`): `Promise`<`undefined` \| `string`[]\>

Retrieves a variable that is an array.

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `name` | `string` | `undefined` | the name of the variable to retrieve. |
| `defaultValue` | `undefined` | `undefined` | the default value for the variable if it does not exist. |

##### Returns

`Promise`<`undefined` \| `string`[]\>

the array variable.

##### Defined in

[index.ts:1142](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1142)

___

#### getDeviceAddress

▸ **getDeviceAddress**(`target`, `refresh`): `Promise`<`string`\>

Returns the address of a targeted device

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |
| `refresh` | `boolean` | whether you would like to refresh before retrieving the address.  Defaults to false. |

##### Returns

`Promise`<`string`\>

the address of the device.

##### Defined in

[index.ts:695](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L695)

___

#### getDeviceBattery

▸ **getDeviceBattery**(`target`, `refresh`): `Promise`<`number`\>

Returns the battery of a targeted device.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |
| `refresh` | `boolean` | whether you would like to refresh before retrieving the battery.  Defaults to false. |

##### Returns

`Promise`<`number`\>

the battery of the device.

##### Defined in

[index.ts:735](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L735)

___

#### getDeviceCoordinates

▸ **getDeviceCoordinates**(`target`, `refresh`): `Promise`<`number`[]\>

Retrieves the coordinates of the device's location.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |
| `refresh` | `boolean` | whether you would like to refresh before retrieving the coordinates. |

##### Returns

`Promise`<`number`[]\>

the coordinates of the device's location.

##### Defined in

[index.ts:705](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L705)

___

#### getDeviceId

▸ **getDeviceId**(`target`): `Promise`<`string`\>

Returns the ID of a targeted device.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |

##### Returns

`Promise`<`string`\>

the device ID.

##### Defined in

[index.ts:666](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L666)

___

#### getDeviceIndoorLocation

▸ **getDeviceIndoorLocation**(`target`, `refresh`): `Promise`<`string`\>

Returns the indoor location of a targeted device.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |
| `refresh` | `boolean` | whether you would like to refresh before retrieving the location.  Defaults to false. |

##### Returns

`Promise`<`string`\>

the indoor location of the device.

##### Defined in

[index.ts:725](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L725)

___

#### getDeviceLatLong

▸ **getDeviceLatLong**(`target`, `refresh?`): `Promise`<`number`[]\>

Returns the latitude and longitude coordinates of a targeted device.

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `target` | `string` | `undefined` | the device or interaction URN. |
| `refresh` | `boolean` | `false` | whether you would like to refresh before retrieving the coordinates. Defaults to false. |

##### Returns

`Promise`<`number`[]\>

an array containing the latitude and longitude of the device.

##### Defined in

[index.ts:715](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L715)

___

#### getDeviceLocation

▸ **getDeviceLocation**(`target`, `refresh`): `Promise`<`string`\>

Returns the location of a targeted device.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |
| `refresh` | `boolean` | whether you would like to refresh before retrieving the location.  Defaults to false. |

##### Returns

`Promise`<`string`\>

the location of the device.

##### Defined in

[index.ts:676](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L676)

___

#### getDeviceLocationEnabled

▸ **getDeviceLocationEnabled**(`target`): `Promise`<`boolean`\>

Returns whether the location services on a device are enabled.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |

##### Returns

`Promise`<`boolean`\>

'true' if the device's location services are enabled, 'false' otherwise.

##### Defined in

[index.ts:685](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L685)

___

#### getDeviceName

▸ **getDeviceName**(`target`): `Promise`<`string`\>

Returns the name of a targeted device.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |

##### Returns

`Promise`<`string`\>

the name of the device.

##### Defined in

[index.ts:656](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L656)

___

#### getDeviceType

▸ **getDeviceType**(`target`): `Promise`<[`DeviceType`](#enumsenumsdevicetypemd)\>

Returns the device type of a targeted device, i.e. gen 2, gen 3, etc.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |

##### Returns

`Promise`<[`DeviceType`](#enumsenumsdevicetypemd)\>

the device type.

##### Defined in

[index.ts:744](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L744)

___

#### getGroupMembers

▸ **getGroupMembers**(`groupUri`): `Promise`<`string`[]\>

Returns the members of a particular group.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `groupUri` | `string` | the URN of the group that you would like to retrieve the members from. |

##### Returns

`Promise`<`string`[]\>

a list of members within the specified group.

##### Defined in

[index.ts:954](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L954)

___

#### getMappedVar

▸ **getMappedVar**<`Type`\>(`name`, `mapper`, `defaultValue?`): `Promise`<`undefined` \| `Type`\>

Retrieves a mapped variable.

##### Type parameters

| Name |
| :------ |
| `Type` |

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `name` | `string` | `undefined` | the name of the variable to retrieve. |
| `mapper` | [`Mapper`](#mapper)<`Type`\> | `undefined` | the mapper. |
| `defaultValue` | `undefined` | `undefined` | the default value for the variable if it does not exist. |

##### Returns

`Promise`<`undefined` \| `Type`\>

the value of the mapper variable.

##### Defined in

[index.ts:1118](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1118)

___

#### getNumberArrayVar

▸ **getNumberArrayVar**(`name`, `defaultValue?`): `Promise`<`undefined` \| `number`[]\>

Retrieves a variable that is an array of numbers.

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `name` | `string` | `undefined` | the name of the variable to retrieve. |
| `defaultValue` | `undefined` | `undefined` | the default value for the variable if it does not exist. |

##### Returns

`Promise`<`undefined` \| `number`[]\>

the array variable.

##### Defined in

[index.ts:1152](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1152)

___

#### getNumberVar

▸ **getNumberVar**(`name`, `defaultValue?`): `Promise`<`undefined` \| `number`\>

Retrieves a variable that has a numerical value.

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `name` | `string` | `undefined` | the name of the variable to retrieve. |
| `defaultValue` | `undefined` | `undefined` | the default value for the variable if it does not exist. |

##### Returns

`Promise`<`undefined` \| `number`\>

the numerical variable.

##### Defined in

[index.ts:1132](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1132)

___

#### getUnreadInboxSize

▸ **getUnreadInboxSize**(`target`): `Promise`<`number`\>

Retrieves the number of messages in a device's inbox.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN whose inbox you would like to check. |

##### Returns

`Promise`<`number`\>

the number of messages in the specified device's inbox.

##### Defined in

[index.ts:895](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L895)

___

#### getUserProfile

▸ **getUserProfile**(`target`): `Promise`<`string`\>

Returns the user profile of a targeted device

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interacton URN. |

##### Returns

`Promise`<`string`\>

the user profile registered to the device.

##### Defined in

[index.ts:635](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L635)

___

#### getVar

▸ **getVar**(`name`, `defaultValue?`): `Promise`<`undefined` \| `string`\>

Retrieves a variable that was set either during workflow registration
or through the set_var() function.  The variable can be retrieved anywhere
within the workflow, but is erased after the workflow terminates.

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `name` | `string` | `undefined` | the name of the variable to be retrieved. |
| `defaultValue` | `undefined` | `undefined` | default value of the variable if it does not exist.  Defaults to undefined. |

##### Returns

`Promise`<`undefined` \| `string`\>

the variable requested.

##### Defined in

[index.ts:1102](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1102)

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

[index.ts:878](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L878)

___

#### isGroupMember

▸ **isGroupMember**(`groupNameUri`, `potentialMemberNameUri`): `Promise`<`boolean`\>

Checks whether a device is a member of a particular group.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `groupNameUri` | `string` | the URN of a group. |
| `potentialMemberNameUri` | `string` | the URN of the device name. |

##### Returns

`Promise`<`boolean`\>

'true' if the device is a member of a specified group, 'false' otherwise.

##### Defined in

[index.ts:965](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L965)

___

#### ledAction

▸ **ledAction**(`target`, `effect`, `args`): `Promise`<`void`\>

Used for performing actions on the LEDs, such as creating
a rainbow, flashing, rotating, etc.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the interaction URN. |
| `effect` | [`LedEffect`](#ledeffect) | effect to perform on LEDs, can be 'rainbow', 'rotate', 'flash', 'breath', 'static', or 'off'. |
| `args` | [`LedInfo`](#ledinfo) | optional arguments for LED actions.  Defauls to None. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:486](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L486)

___

#### listen

▸ **listen**(`target`, `phrases?`, `__namedParameters?`): `Promise`<[`ListenResponse`](#listenresponse)\>

Listens for the user to speak into the device.  Utilizes speech to text functionality to interact
with the user.

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `target` | `string` | `undefined` | the interaction URN. |
| `phrases` | `never`[] | `[]` | optional phrases that you would like to limit the user's response to.  Defualts to none. |
| `__namedParameters` | `Object` | `{}` | - |
| `__namedParameters.alt_lang` | `undefined` \| [`Language`](#enumsenumslanguagemd) | `undefined` | - |
| `__namedParameters.timeout` | `undefined` \| `number` | `undefined` | - |
| `__namedParameters.transcribe` | `undefined` \| `boolean` | `undefined` | - |

##### Returns

`Promise`<[`ListenResponse`](#listenresponse)\>

text representation of what the user had spoken into the device.

##### Defined in

[index.ts:831](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L831)

___

#### logMessage

▸ **logMessage**(`message`, `category?`): `Promise`<`void`\>

Log an analytics event from a workflow with the specified content and
under a specified category. This does not log the device who
triggered the workflow that called this function.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | a description for your analytical event. |
| `category` | `string` | a category for your analytical event. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:989](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L989)

___

#### logUserMessage

▸ **logUserMessage**(`message`, `target`, `category?`): `Promise`<`void`\>

Log an analytic event from a workflow with the specified content and
under a specified category.  This includes the device who triggered the workflow
that called this function.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | a description for your analytical event. |
| `target` | `string` | the URN of a device that triggered this function. |
| `category` | `string` | a category for your analytical event. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:1005](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1005)

___

#### notify

▸ **notify**(`target`, `originator`, `name`, `text`, `pushOptions?`): `Promise`<`void`\>

Sends out a notification message to a group of devices.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the group URN that you would like to notify. |
| `originator` | `string` | the device URN that triggered the notification. |
| `name` | `string` | a name for your notification. |
| `text` | `string` | the text that you would like to be spoken out of the device as your notification. |
| `pushOptions?` | [`NotificationOptions`](#notificationoptions) | push options for if the notification is sent to the Relay app on a virtual device.  Defaults to {}. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:559](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L559)

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

[index.ts:96](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L96)

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

[index.ts:91](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L91)

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

[index.ts:870](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L870)

___

#### play

▸ **play**(`target`, `filename`): `Promise`<`string`\>

Plays a custom audio file that was uploaded by the user.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the interaction URN. |
| `filename` | `string` | the name of the audio file. |

##### Returns

`Promise`<`string`\>

the response ID after the audio file has been played on the device.

##### Defined in

[index.ts:369](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L369)

___

#### playAndWait

▸ **playAndWait**(`target`, `filename`): `Promise`<`string`\>

Plays a custom audio file that was uploaded by the user.  Waits until the audio
file has finished playing before continuing through the workflow.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the interaction URN. |
| `filename` | `string` | the name of the audio file. |

##### Returns

`Promise`<`string`\>

the response ID after the audio file has been played on the device.

##### Defined in

[index.ts:381](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L381)

___

#### playUnreadInboxMessages

▸ **playUnreadInboxMessages**(`target`): `Promise`<`void`\>

Play a targeted device's inbox messages.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN whose inbox messages you would like to play. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:904](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L904)

___

#### powerDownDevice

▸ **powerDownDevice**(`target`): `Promise`<`void`\>

Powers down a device during a workflow, without having to physically power down
the device via holding down the '+' button.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the URN of the device that you would like to power down. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:608](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L608)

___

#### rainbow

▸ **rainbow**(`target`, `rotations?`): `Promise`<`void`\>

Switches all of the LEDs on to a configured rainbow pattern and rotates the rainbow
a specified number of times.

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `target` | [`Target`](#target) | `undefined` | the interaction URN |
| `rotations` | `number` | `-1` | the number of times you would like the rainbow to rotate. Defaults to -1, meaning the rainbow will rotate indefinitely. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:443](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L443)

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

[index.ts:882](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L882)

___

#### resolveIncident

▸ **resolveIncident**(`incidentId`, `reason`): `Promise`<`void`\>

Resolves an incident that was created.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `incidentId` | `string` | the ID of the incident that you would like to resolve. |
| `reason` | `string` | the reason for resolving the incident. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:1212](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1212)

___

#### restartDevice

▸ **restartDevice**(`target`): `Promise`<`void`\>

Restarts a device during a workflow, without having
to physically restart the device via hodling down the '-' button.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the URN of the device you would like to restart. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:599](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L599)

___

#### rotate

▸ **rotate**(`target`, `color?`): `Promise`<`void`\>

Switches all of the LEDs on a device to a certain color and rotates them a specified number
of times.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the interaction URN. |
| `color` | `string` | the hex color code you would like to turn the LEDs to. Defaults to 'FFFFFF'. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:454](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L454)

___

#### say

▸ **say**(`target`, `text`, `lang?`): `Promise`<`string`\>

Utilizes text to speech capabilities to make the device 'speak' to the user

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `target` | [`Target`](#target) | `undefined` | the interaction URN. |
| `text` | `string` | `undefined` | what you would like the device to say. |
| `lang` | [`Language`](#enumsenumslanguagemd) | `Language.ENGLISH` | the language of the text that is being spoken.  Defaults to 'en-US'. |

##### Returns

`Promise`<`string`\>

the response ID after the device speaks to the user.

##### Defined in

[index.ts:344](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L344)

___

#### sayAndWait

▸ **sayAndWait**(`target`, `text`, `lang?`): `Promise`<`string`\>

Utilizes text to speech capabilities to make the device 'speak' to the user.
Waits until the text is fully played out on the device before continuing.

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `target` | [`Target`](#target) | `undefined` | the interaction URN. |
| `text` | `string` | `undefined` | what you would like the device to say. |
| `lang` | [`Language`](#enumsenumslanguagemd) | `Language.ENGLISH` | the language of the text that is being spoken.  Defaults to 'en-US'. |

##### Returns

`Promise`<`string`\>

the response ID after the device speaks to the user.

##### Defined in

[index.ts:357](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L357)

___

#### set

▸ **set**(`obj`, `value?`): `Promise`<`void`\>

Used to set an object with with a specified value.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `obj` | `Record`<`string`, `string`\> | a Record object that you would like to set. |
| `value?` | `string` | the value that you want your object to have. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:1063](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1063)

___

#### setChannel

▸ **setChannel**(`target`, `name`, `__namedParameters?`): `Promise`<`void`\>

Sets the channel that a device is on.  This can be used to change the channel of a device during a workflow,
where the channel will also be updated on the Relay Dash.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |
| `name` | `string` | the name of the channel you would like to set your device to. |
| `__namedParameters` | `Object` | - |
| `__namedParameters.disableHomeChannel?` | ``false`` | - |
| `__namedParameters.suppressTTS?` | `boolean` | - |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:818](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L818)

___

#### setDefaultAnalyticEventParameters

▸ **setDefaultAnalyticEventParameters**(`params`): `Promise`<`void`\>

Sets default analytical event parameters.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `Record`<`string`, `string` \| `number` \| `boolean`\> | any default parameters for an analytical event that you would like to set. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:978](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L978)

___

#### setDeviceChannel

▸ **setDeviceChannel**(`target`, `channel`): `Promise`<`void`\>

Sets the channel of a targeted device and updates it on the Relay Dash.
The new channel remains until it is set again via a workflow or updated on the
Relay Dash.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |
| `channel` | `string` | the channel that you would like to update your device to. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:778](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L778)

___

#### setDeviceMode

▸ **setDeviceMode**(`target`, `mode`): `Promise`<`void`\>

Sets the mode of the device.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |
| `mode` | ``"panic"`` \| ``"alarm"`` \| ``"none"`` | the updated mode of the device, which can be 'panic', 'alarm', or 'none'. Defaults to 'none'. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:806](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L806)

___

#### setDeviceName

▸ **setDeviceName**(`target`, `name`): `Promise`<`void`\>

Sets the name of a targeted device and updates it on the Relay Dash.
The name remains updated until it is set again via a workflow or updated manually
on the Relay Dash.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the device or interaction URN. |
| `name` | `string` | a new name for your device. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:766](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L766)

___

#### setTimer

▸ **setTimer**(`type`, `name`, `timeout?`, `timeout_type`): `Promise`<`void`\>

Serves as a named timer that can be either interval or timeout.  Allows you to specify
the unit of time.

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `type` | [`TimerType`](#enumsenumstimertypemd) | `undefined` | can be 'timeout' or 'interval'.  Defaults to 'timeout'. |
| `name` | `string` | `undefined` | a name for your timer |
| `timeout` | `number` | `60` | an integer representing when you would like your timer to stop. |
| `timeout_type` | [`TimeoutType`](#enumsenumstimeouttypemd) | `undefined` | can be 'ms', 'secs', 'mins' or 'hrs'. Defaults to 'secs'. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:925](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L925)

___

#### setUserProfile

▸ **setUserProfile**(`target`, `username`, `force?`): `Promise`<`void`\>

Sets the profile of a user by updating the username.

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `target` | `string` | `undefined` | the device URN whose profile you would like to update. |
| `username` | `string` | `undefined` | the updated username for the device. |
| `force` | `boolean` | `false` | whether you would like to force this update.  Defaults to false. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:646](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L646)

___

#### setVar

▸ **setVar**(`name`, `value`): `Promise`<`void`\>

Sets a variable with the corresponding name and value. Scope of
the variable is from start to end of a workflow.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | name of the variable to be created. |
| `value` | `string` | value that the variable will hold. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:1054](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1054)

___

#### startInteraction

▸ **startInteraction**(`target`, `name`, `options`): `Promise`<`void`\>

Starts an interaction with the user.  Triggers an INTERACTION_STARTED event
and allows the user to interact with the device via functions that require an
interaction URN.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the device that you would like to start an interaction with. |
| `name` | `string` | a name for you r interaction. |
| `options` | [`InteractionOptions`](#interactionoptions) | can be color, home channel, or input types. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:323](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L323)

___

#### startTimer

▸ **startTimer**(`timeout?`): `Promise`<`void`\>

Starts an unnamed timer, meaning this will be the only timer on your device.
The timer will stop when it reaches the limit of the 'timeout' parameter.

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `timeout` | `number` | `60` | the number of seconds you would like to wait until the timer stops. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:1185](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1185)

___

#### stopTimer

▸ **stopTimer**(): `Promise`<`void`\>

Stops an unnamed timer.

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:1192](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1192)

___

#### switchAllLedOff

▸ **switchAllLedOff**(`target`): `Promise`<`void`\>

Switches all of the LEDs on a device off.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the interaction URN. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:432](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L432)

___

#### switchAllLedOn

▸ **switchAllLedOn**(`target`, `color`): `Promise`<`void`\>

Switches all of the LEDs on a device on to a specified color.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the interaction URN. |
| `color` | `string` | the hex color code you would like the LEDs to be. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:424](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L424)

___

#### switchLedOn

▸ **switchLedOn**(`target`, `led`, `color`): `Promise`<`void`\>

Switches on an LED at a particular index to a specified color.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the interaction URN. |
| `led` | [`LedIndex`](#ledindex) | the index of an LED, numbered 1-12. |
| `color` | `string` | the hex color code that you would like to set the LED to. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:415](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L415)

___

#### terminate

▸ **terminate**(): `Promise`<`void`\>

Terminates a workflow.  This method is usually called
after your workflow has completed and you would like to end the
workflow by calling end_interaction(), where you can then terminate
the workflow.

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:1222](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1222)

___

#### trackEvent

▸ **trackEvent**(`category`, `parameters?`): `Promise`<`void`\>

Tracks an analytical event that doesn't specify the user.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `category` | `string` | the category of the analytical event. |
| `parameters?` | [`TrackEventParameters`](#trackeventparameters) | any TrackEventParameters you would like to include. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:1019](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1019)

___

#### trackUserEvent

▸ **trackUserEvent**(`category`, `target`, `parameters?`): `Promise`<`void`\>

Tracks an analytical event that specifies the user.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `category` | `string` | the category of the analytical event. |
| `target` | `string` | the user associated with the event. |
| `parameters?` | [`TrackEventParameters`](#trackeventparameters) | any TrackEventParameters you would like to include. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:1036](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1036)

___

#### translate

▸ **translate**(`text`, `from?`, `to?`): `Promise`<`string`\>

Translates the text from one language to another.

##### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `text` | `string` | `undefined` | the text that you would like to translate. |
| `from` | [`Language`](#enumsenumslanguagemd) | `Language.ENGLISH` | the languagef that you would like to translate from. |
| `to` | [`Language`](#enumsenumslanguagemd) | `Language.SPANISH` | the language that you would like to translate to. |

##### Returns

`Promise`<`string`\>

the translated text.

##### Defined in

[index.ts:944](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L944)

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

[index.ts:886](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L886)

___

#### unset

▸ **unset**(`names`): `Promise`<`void`\>

Unsets the value of one or many variables.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `names` | `string` \| `string`[] | the name or names of the variable you would like to unset. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:1086](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1086)

___

#### unsetVar

▸ **unsetVar**(`name`): `Promise`<`void`\>

Unsets the value of a variable.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | the name of the variable whose value you would like to unset. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:1078](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1078)

___

#### vibrate

▸ **vibrate**(`target`, `pattern`): `Promise`<`void`\>

Makes the device vibrate in a particular pattern.  You can specify
how many vibrations you would like, the duration of each vibration in
milliseconds, and how long you would like the pauses between each vibration to last
in milliseconds.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the interaction URN. |
| `pattern` | `number`[] | an array representing the pattern of your vibration.  Defaults to none. |

##### Returns

`Promise`<`void`\>

##### Defined in

[index.ts:405](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L405)

# Enums


<a name="enumsenumsbuttonmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Button

## Enumeration: Button

[enums](#modulesenumsmd).Button

Whether the button press was on the action button, or
the channel button.

### Table of contents

#### Enumeration Members

- [ACTION](#action)
- [CHANNEL](#channel)

### Enumeration Members

#### ACTION

• **ACTION**

##### Defined in

[enums.ts:45](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L45)

___

#### CHANNEL

• **CHANNEL**

##### Defined in

[enums.ts:46](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L46)


<a name="enumsenumscalldirectionmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / CallDirection

## Enumeration: CallDirection

[enums](#modulesenumsmd).CallDirection

Specifies whether a call is inbound or outbound.

### Table of contents

#### Enumeration Members

- [INBOUND](#inbound)
- [OUTBOUND](#outbound)

### Enumeration Members

#### INBOUND

• **INBOUND**

##### Defined in

[enums.ts:36](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L36)

___

#### OUTBOUND

• **OUTBOUND**

##### Defined in

[enums.ts:37](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L37)


<a name="enumsenumsdeviceinfofieldmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / DeviceInfoField

## Enumeration: DeviceInfoField

[enums](#modulesenumsmd).DeviceInfoField

Information fields on the device.

### Table of contents

#### Enumeration Members

- [CHANNEL](#channel)
- [LABEL](#label)
- [LOCATION\_ENABLED](#location_enabled)

### Enumeration Members

#### CHANNEL

• **CHANNEL**

##### Defined in

[enums.ts:124](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L124)

___

#### LABEL

• **LABEL**

##### Defined in

[enums.ts:123](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L123)

___

#### LOCATION\_ENABLED

• **LOCATION\_ENABLED**

##### Defined in

[enums.ts:125](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L125)


<a name="enumsenumsdeviceinfoquerymd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / DeviceInfoQuery

## Enumeration: DeviceInfoQuery

[enums](#modulesenumsmd).DeviceInfoQuery

Information dealing with the device name, id, type,
location, battery, and username.

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

[enums.ts:110](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L110)

___

#### BATTERY

• **BATTERY**

##### Defined in

[enums.ts:112](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L112)

___

#### COORDINATES

• **COORDINATES**

##### Defined in

[enums.ts:111](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L111)

___

#### ID

• **ID**

##### Defined in

[enums.ts:108](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L108)

___

#### INDOOR\_LOCATION

• **INDOOR\_LOCATION**

##### Defined in

[enums.ts:113](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L113)

___

#### LOCATION

• **LOCATION**

##### Defined in

[enums.ts:114](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L114)

___

#### LOCATION\_ENABLED

• **LOCATION\_ENABLED**

##### Defined in

[enums.ts:116](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L116)

___

#### NAME

• **NAME**

##### Defined in

[enums.ts:107](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L107)

___

#### TYPE

• **TYPE**

##### Defined in

[enums.ts:109](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L109)

___

#### USERNAME

• **USERNAME**

##### Defined in

[enums.ts:115](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L115)


<a name="enumsenumsdevicetypemd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / DeviceType

## Enumeration: DeviceType

[enums](#modulesenumsmd).DeviceType

The device type, including the Relay Dash or app.

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

[enums.ts:136](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L136)

___

#### RELAY

• **RELAY**

##### Defined in

[enums.ts:132](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L132)

___

#### RELAY2

• **RELAY2**

##### Defined in

[enums.ts:133](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L133)

___

#### RELAY\_APP

• **RELAY\_APP**

##### Defined in

[enums.ts:134](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L134)

___

#### ROIP

• **ROIP**

##### Defined in

[enums.ts:135](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L135)


<a name="enumsenumseventmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Event

## Enumeration: Event

[enums](#modulesenumsmd).Event

Different events that can happen during a workflow, including
an error, interaction lifecycle events, button presses, timers
or notificaions, incidents, speech, and calls.

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

[enums.ts:18](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L18)

___

#### CALL\_CONNECTED

• **CALL\_CONNECTED**

##### Defined in

[enums.ts:25](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L25)

___

#### CALL\_DISCONNECTED

• **CALL\_DISCONNECTED**

##### Defined in

[enums.ts:26](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L26)

___

#### CALL\_FAILED

• **CALL\_FAILED**

##### Defined in

[enums.ts:27](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L27)

___

#### CALL\_RECEIVED

• **CALL\_RECEIVED**

##### Defined in

[enums.ts:28](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L28)

___

#### CALL\_RINGING

• **CALL\_RINGING**

##### Defined in

[enums.ts:24](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L24)

___

#### CALL\_START\_REQUEST

• **CALL\_START\_REQUEST**

##### Defined in

[enums.ts:29](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L29)

___

#### ERROR

• **ERROR**

##### Defined in

[enums.ts:9](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L9)

___

#### INCIDENT

• **INCIDENT**

##### Defined in

[enums.ts:21](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L21)

___

#### INTERACTION\_ENDED

• **INTERACTION\_ENDED**

##### Defined in

[enums.ts:16](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L16)

___

#### INTERACTION\_FAILED

• **INTERACTION\_FAILED**

##### Defined in

[enums.ts:17](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L17)

___

#### INTERACTION\_LIFECYCLE

• **INTERACTION\_LIFECYCLE**

##### Defined in

[enums.ts:12](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L12)

___

#### INTERACTION\_RESUMED

• **INTERACTION\_RESUMED**

##### Defined in

[enums.ts:14](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L14)

___

#### INTERACTION\_STARTED

• **INTERACTION\_STARTED**

##### Defined in

[enums.ts:13](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L13)

___

#### INTERACTION\_SUSPENDED

• **INTERACTION\_SUSPENDED**

##### Defined in

[enums.ts:15](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L15)

___

#### NOTIFICATION

• **NOTIFICATION**

##### Defined in

[enums.ts:20](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L20)

___

#### PROMPT

• **PROMPT**

##### Defined in

[enums.ts:22](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L22)

___

#### SPEECH

• **SPEECH**

##### Defined in

[enums.ts:23](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L23)

___

#### START

• **START**

##### Defined in

[enums.ts:10](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L10)

___

#### STOP

• **STOP**

##### Defined in

[enums.ts:11](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L11)

___

#### TIMER

• **TIMER**

##### Defined in

[enums.ts:19](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L19)


<a name="enumsenumsincidentstatusmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / IncidentStatus

## Enumeration: IncidentStatus

[enums](#modulesenumsmd).IncidentStatus

The state of an incident indicating whether it has been resolved or cancelled.

### Table of contents

#### Enumeration Members

- [CANCELLED](#cancelled)
- [RESOLVED](#resolved)

### Enumeration Members

#### CANCELLED

• **CANCELLED**

##### Defined in

[enums.ts:155](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L155)

___

#### RESOLVED

• **RESOLVED**

##### Defined in

[enums.ts:154](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L154)


<a name="enumsenumslanguagemd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Language

## Enumeration: Language

[enums](#modulesenumsmd).Language

The supported languages that can be used for speech, listening,
or translation on the device.

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

[enums.ts:82](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L82)

___

#### BENGALI

• **BENGALI**

##### Defined in

[enums.ts:96](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L96)

___

#### CHINESE

• **CHINESE**

##### Defined in

[enums.ts:81](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L81)

___

#### CZECH

• **CZECH**

##### Defined in

[enums.ts:87](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L87)

___

#### DANISH

• **DANISH**

##### Defined in

[enums.ts:86](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L86)

___

#### DUTCH

• **DUTCH**

##### Defined in

[enums.ts:80](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L80)

___

#### ENGLISH

• **ENGLISH**

##### Defined in

[enums.ts:65](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L65)

___

#### FILIPINO

• **FILIPINO**

##### Defined in

[enums.ts:85](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L85)

___

#### FINNISH

• **FINNISH**

##### Defined in

[enums.ts:99](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L99)

___

#### FRENCH

• **FRENCH**

##### Defined in

[enums.ts:68](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L68)

___

#### GERMAN

• **GERMAN**

##### Defined in

[enums.ts:66](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L66)

___

#### GREEK

• **GREEK**

##### Defined in

[enums.ts:97](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L97)

___

#### GUJURATI

• **GUJURATI**

##### Defined in

[enums.ts:88](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L88)

___

#### HINDI

• **HINDI**

##### Defined in

[enums.ts:73](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L73)

___

#### HUNGARIAN

• **HUNGARIAN**

##### Defined in

[enums.ts:89](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L89)

___

#### ICELANDIC

• **ICELANDIC**

##### Defined in

[enums.ts:74](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L74)

___

#### INDONESIAN

• **INDONESIAN**

##### Defined in

[enums.ts:84](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L84)

___

#### ITALIAN

• **ITALIAN**

##### Defined in

[enums.ts:69](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L69)

___

#### JAPANESE

• **JAPANESE**

##### Defined in

[enums.ts:75](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L75)

___

#### KANNADA

• **KANNADA**

##### Defined in

[enums.ts:98](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L98)

___

#### KOREAN

• **KOREAN**

##### Defined in

[enums.ts:76](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L76)

___

#### MALAY

• **MALAY**

##### Defined in

[enums.ts:95](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L95)

___

#### NORWEGIAN

• **NORWEGIAN**

##### Defined in

[enums.ts:79](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L79)

___

#### POLISH

• **POLISH**

##### Defined in

[enums.ts:77](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L77)

___

#### PORTUGUESE

• **PORTUGUESE**

##### Defined in

[enums.ts:78](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L78)

___

#### PUNJABI

• **PUNJABI**

##### Defined in

[enums.ts:94](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L94)

___

#### ROMANIAN

• **ROMANIAN**

##### Defined in

[enums.ts:93](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L93)

___

#### RUSSIAN

• **RUSSIAN**

##### Defined in

[enums.ts:70](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L70)

___

#### SLOVAK

• **SLOVAK**

##### Defined in

[enums.ts:92](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L92)

___

#### SPANISH

• **SPANISH**

##### Defined in

[enums.ts:67](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L67)

___

#### SWEDISH

• **SWEDISH**

##### Defined in

[enums.ts:71](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L71)

___

#### TAMIL

• **TAMIL**

##### Defined in

[enums.ts:90](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L90)

___

#### TURKISH

• **TURKISH**

##### Defined in

[enums.ts:72](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L72)

___

#### UKRANIAN

• **UKRANIAN**

##### Defined in

[enums.ts:91](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L91)

___

#### VIETNAMESE

• **VIETNAMESE**

##### Defined in

[enums.ts:83](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L83)


<a name="enumsenumsnotificationmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Notification

## Enumeration: Notification

[enums](#modulesenumsmd).Notification

The different types of notifications that can be sent, including
cancelling a notification.

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

[enums.ts:145](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L145)

___

#### BROADCAST

• **BROADCAST**

##### Defined in

[enums.ts:144](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L144)

___

#### CANCEL

• **CANCEL**

##### Defined in

[enums.ts:147](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L147)

___

#### NOTIFY

• **NOTIFY**

##### Defined in

[enums.ts:146](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L146)


<a name="enumsenumsnotificationprioritymd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / NotificationPriority

## Enumeration: NotificationPriority

[enums](#modulesenumsmd).NotificationPriority

The priority of a notification.  Includes normal, critical, or high priority.

### Table of contents

#### Enumeration Members

- [CRITICAL](#critical)
- [HIGH](#high)
- [NORMAL](#normal)

### Enumeration Members

#### CRITICAL

• **CRITICAL**

##### Defined in

[enums.ts:164](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L164)

___

#### HIGH

• **HIGH**

##### Defined in

[enums.ts:163](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L163)

___

#### NORMAL

• **NORMAL**

##### Defined in

[enums.ts:162](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L162)


<a name="enumsenumsnotificationsoundmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / NotificationSound

## Enumeration: NotificationSound

[enums](#modulesenumsmd).NotificationSound

The sound of a notification.  Can be either default or SOS.

### Table of contents

#### Enumeration Members

- [DEFAULT](#default)
- [SOS](#sos)

### Enumeration Members

#### DEFAULT

• **DEFAULT**

##### Defined in

[enums.ts:171](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L171)

___

#### SOS

• **SOS**

##### Defined in

[enums.ts:172](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L172)


<a name="enumsenumstapsmd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / Taps

## Enumeration: Taps

[enums](#modulesenumsmd).Taps

The number of times a user consequtively taps a button, or the
user holds down a button.

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

[enums.ts:55](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L55)

___

#### LONG

• **LONG**

##### Defined in

[enums.ts:57](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L57)

___

#### SINGLE

• **SINGLE**

##### Defined in

[enums.ts:54](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L54)

___

#### TRIPLE

• **TRIPLE**

##### Defined in

[enums.ts:56](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L56)


<a name="enumsenumstimeouttypemd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / TimeoutType

## Enumeration: TimeoutType

[enums](#modulesenumsmd).TimeoutType

The timeout type for a timer.  Can be either milliseconds, seconds, minutes, or hours.

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

[enums.ts:190](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L190)

___

#### MILLISECONDS

• **MILLISECONDS**

##### Defined in

[enums.ts:187](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L187)

___

#### MINUTES

• **MINUTES**

##### Defined in

[enums.ts:189](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L189)

___

#### SECONDS

• **SECONDS**

##### Defined in

[enums.ts:188](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L188)


<a name="enumsenumstimertypemd"></a>

[@relaypro/sdk](#readmemd) / [Exports](#modulesmd) / [enums](#modulesenumsmd) / TimerType

## Enumeration: TimerType

[enums](#modulesenumsmd).TimerType

The type of timer on the device.  Can be a timeout or interval timer type.

### Table of contents

#### Enumeration Members

- [INTERVAL](#interval)
- [TIMEOUT](#timeout)

### Enumeration Members

#### INTERVAL

• **INTERVAL**

##### Defined in

[enums.ts:180](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L180)

___

#### TIMEOUT

• **TIMEOUT**

##### Defined in

[enums.ts:179](https://github.com/relaypro/relay-js/blob/399deba/src/enums.ts#L179)

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

[types.ts:43](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L43)

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

[types.ts:42](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L42)


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

[types.ts:38](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L38)


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

[constants.ts:11](https://github.com/relaypro/relay-js/blob/399deba/src/constants.ts#L11)

___

#### EVENT\_TIMEOUT

• `Const` **EVENT\_TIMEOUT**: ``32000``

##### Defined in

[constants.ts:7](https://github.com/relaypro/relay-js/blob/399deba/src/constants.ts#L7)

___

#### HEARTBEAT

• `Const` **HEARTBEAT**: `number`

##### Defined in

[constants.ts:4](https://github.com/relaypro/relay-js/blob/399deba/src/constants.ts#L4)

___

#### NON\_INTERACTIVE\_ACTIONS

• `Const` **NON\_INTERACTIVE\_ACTIONS**: `string`[]

##### Defined in

[constants.ts:15](https://github.com/relaypro/relay-js/blob/399deba/src/constants.ts#L15)

___

#### NOTIFICATION\_TIMEOUT

• `Const` **NOTIFICATION\_TIMEOUT**: ``60000``

##### Defined in

[constants.ts:9](https://github.com/relaypro/relay-js/blob/399deba/src/constants.ts#L9)

___

#### PORT

• `Const` **PORT**: `number`

##### Defined in

[constants.ts:3](https://github.com/relaypro/relay-js/blob/399deba/src/constants.ts#L3)

___

#### PROGRESS\_EVENT

• `Const` **PROGRESS\_EVENT**: ``"wf_api_progress_event"``

##### Defined in

[constants.ts:12](https://github.com/relaypro/relay-js/blob/399deba/src/constants.ts#L12)

___

#### REFRESH\_TIMEOUT

• `Const` **REFRESH\_TIMEOUT**: ``45000``

##### Defined in

[constants.ts:8](https://github.com/relaypro/relay-js/blob/399deba/src/constants.ts#L8)

___

#### TIMEOUT

• `Const` **TIMEOUT**: ``5000``

##### Defined in

[constants.ts:6](https://github.com/relaypro/relay-js/blob/399deba/src/constants.ts#L6)


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

[index.ts:53](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L53)

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

[index.ts:1236](https://github.com/relaypro/relay-js/blob/399deba/src/index.ts#L1236)


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

[types.ts:196](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L196)

___

#### AnyPrimitive

Ƭ **AnyPrimitive**: `undefined` \| `symbol` \| `string` \| `boolean` \| `number` \| [`string` \| `boolean` \| `number`]

##### Defined in

[types.ts:233](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L233)

___

#### AudioResponse

Ƭ **AudioResponse**: `Record`<``"audio"``, `string`\>

##### Defined in

[types.ts:229](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L229)

___

#### BaseCallEvent

Ƭ **BaseCallEvent**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `call_id` | `string` |

##### Defined in

[types.ts:282](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L282)

___

#### ButtonEvent

Ƭ **ButtonEvent**: [`Event`](#event) & { `button`: [`Button`](#enumsenumsbuttonmd) ; `taps`: [`Taps`](#enumsenumstapsmd)  }

##### Defined in

[types.ts:167](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L167)

___

#### ButtonTrigger

Ƭ **ButtonTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) & { `action`: ``"action_button_single_tap"`` \| ``"action_button_double_tap"`` \| ``"action_button_triple_tap"``  } |
| `type` | ``"button"`` |

##### Defined in

[types.ts:100](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L100)

___

#### Call

Ƭ **Call**: [`StartedCallEvent`](#startedcallevent) \| [`ReceivedCallEvent`](#receivedcallevent) \| [`ConnectedCallEvent`](#connectedcallevent) \| [`DisconnectedCallEvent`](#disconnectedcallevent) \| [`FailedCallEvent`](#failedcallevent)

##### Defined in

[types.ts:304](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L304)

___

#### ConnectedCallEvent

Ƭ **ConnectedCallEvent**: [`ReceivedCallEvent`](#receivedcallevent) & { `connect_time_epoch`: `number`  }

##### Defined in

[types.ts:296](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L296)

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

[types.ts:310](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L310)

___

#### DisconnectedCallEvent

Ƭ **DisconnectedCallEvent**: [`ConnectedCallEvent`](#connectedcallevent) & { `end_time_epoch`: `number` ; `reason`: `string`  }

##### Defined in

[types.ts:299](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L299)

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

[types.ts:155](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L155)

___

#### Event

Ƭ **Event**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `source_uri` | `string` |

##### Defined in

[types.ts:147](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L147)

___

#### FailedCallEvent

Ƭ **FailedCallEvent**: [`DisconnectedCallEvent`](#disconnectedcallevent)

##### Defined in

[types.ts:303](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L303)

___

#### GroupTarget

Ƭ **GroupTarget**: `string`

##### Defined in

[types.ts:207](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L207)

___

#### HomeChannelBehavior

Ƭ **HomeChannelBehavior**: ``"suspend"`` \| ``"normal"``

##### Defined in

[types.ts:220](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L220)

___

#### HttpTrigger

Ƭ **HttpTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) & { `args`: `Record`<`string`, `string`\>  } |
| `type` | ``"http"`` |

##### Defined in

[types.ts:107](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L107)

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

[types.ts:198](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L198)

___

#### InputType

Ƭ **InputType**: ``"action_button_single_tap"`` \| ``"action_button_double_tap"`` \| ``"action_button_triple_tap"`` \| ``"action_button_long_press"`` \| ``"channel_button_double_tap"`` \| ``"channel_button_triple_tap"``

##### Defined in

[types.ts:213](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L213)

___

#### InteractionLifecycle

Ƭ **InteractionLifecycle**: ``"started"`` \| ``"resumed"`` \| ``"suspended"`` \| ``"ended"`` \| ``"failed"``

##### Defined in

[types.ts:141](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L141)

___

#### InteractionLifecycleEvent

Ƭ **InteractionLifecycleEvent**: [`Event`](#event) & { `reason?`: `string` ; `type`: `string`  }

##### Defined in

[types.ts:134](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L134)

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

[types.ts:222](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L222)

___

#### LedEffect

Ƭ **LedEffect**: ``"off"`` \| ``"breathe"`` \| ``"flash"`` \| ``"rotate"`` \| ``"rainbow"`` \| ``"static"``

##### Defined in

[types.ts:240](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L240)

___

#### LedIndex

Ƭ **LedIndex**: ``"ring"`` \| ``1`` \| ``2`` \| ``3`` \| ``4`` \| ``5`` \| ``6`` \| ``7`` \| ``8`` \| ``9`` \| ``10`` \| ``11`` \| ``12`` \| ``13`` \| ``14`` \| ``15`` \| ``16`` \| ``"1"`` \| ``"2"`` \| ``"3"`` \| ``"4"`` \| ``"5"`` \| ``"6"`` \| ``"7"`` \| ``"8"`` \| ``"9"`` \| ``"10"`` \| ``"11"`` \| ``"12"`` \| ``"13"`` \| ``"14"`` \| ``"15"`` \| ``"16"``

##### Defined in

[types.ts:239](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L239)

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

[types.ts:241](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L241)

___

#### ListenResponse

Ƭ **ListenResponse**: [`TranscriptionResponse`](#transcriptionresponse) \| [`AudioResponse`](#audioresponse)

##### Defined in

[types.ts:231](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L231)

___

#### LocalWebSocket

Ƭ **LocalWebSocket**: `WebSocket` & { `connectionId`: `string` ; `isAlive`: `boolean`  }

##### Defined in

[types.ts:32](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L32)

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

[types.ts:235](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L235)

___

#### Maybe

Ƭ **Maybe**<`T`\>: `T` \| ``null`` \| `undefined`

##### Type parameters

| Name |
| :------ |
| `T` |

##### Defined in

[types.ts:20](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L20)

___

#### NfcTrigger

Ƭ **NfcTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) & { `nfc_payload`: `Record`<`string`, `string`\> ; `uid`: `string`  } |
| `type` | ``"nfc"`` |

##### Defined in

[types.ts:114](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L114)

___

#### NotificationEvent

Ƭ **NotificationEvent**: [`Event`](#event) & { `event`: `string` ; `name`: `string` ; `notification_state`: [`NotificationState`](#notificationstate)  }

##### Defined in

[types.ts:174](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L174)

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

[types.ts:256](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L256)

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

[types.ts:263](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L263)

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

[types.ts:26](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L26)

___

#### OtherTrigger

Ƭ **OtherTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) |
| `type` | ``"emergency"`` \| ``"other"`` \| ``"calendar"`` \| ``"geofence"`` \| ``"telephony"`` |

##### Defined in

[types.ts:123](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L123)

___

#### PhraseTrigger

Ƭ **PhraseTrigger**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | [`TriggerArgs`](#triggerargs) & { `phrase`: `string` ; `spillover`: `string`  } |
| `type` | ``"phrase"`` |

##### Defined in

[types.ts:92](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L92)

___

#### PlaceCall

Ƭ **PlaceCall**: `Partial`<`Omit`<[`StartedCallEvent`](#startedcallevent), ``"call_id"``\>\>

##### Defined in

[types.ts:288](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L288)

___

#### ProgressingCallEvent

Ƭ **ProgressingCallEvent**: [`ReceivedCallEvent`](#receivedcallevent)

##### Defined in

[types.ts:295](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L295)

___

#### PromptEvent

Ƭ **PromptEvent**: [`Event`](#event) & { `id`: `string` ; `type`: `string`  }

##### Defined in

[types.ts:189](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L189)

___

#### RawWorkflowEvent

Ƭ **RawWorkflowEvent**: [`UnionToIntersection`](#uniontointersection)<`WorkflowEvent`\> & { `_id`: `string` ; `_type`: `string`  }

##### Defined in

[types.ts:75](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L75)

___

#### ReceivedCallEvent

Ƭ **ReceivedCallEvent**: [`StartedCallEvent`](#startedcallevent) & { `direction`: [`CallDirection`](#enumsenumscalldirectionmd) ; `onnet`: `boolean` ; `start_time_epoch`: `number`  }

##### Defined in

[types.ts:289](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L289)

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

[types.ts:274](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L274)

___

#### RingingCallEvent

Ƭ **RingingCallEvent**: [`ReceivedCallEvent`](#receivedcallevent)

##### Defined in

[types.ts:294](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L294)

___

#### SingleTarget

Ƭ **SingleTarget**: `string`

##### Defined in

[types.ts:208](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L208)

___

#### SpeechEvent

Ƭ **SpeechEvent**: [`Event`](#event) & { `audio`: `string` ; `lang`: `string` ; `request_id`: `string` ; `text`: `string`  }

##### Defined in

[types.ts:180](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L180)

___

#### StartEvent

Ƭ **StartEvent**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `trigger` | [`PhraseTrigger`](#phrasetrigger) \| [`ButtonTrigger`](#buttontrigger) \| [`HttpTrigger`](#httptrigger) \| [`NfcTrigger`](#nfctrigger) \| [`OtherTrigger`](#othertrigger) |

##### Defined in

[types.ts:159](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L159)

___

#### StartedCallEvent

Ƭ **StartedCallEvent**: [`BaseCallEvent`](#basecallevent) & { `uri`: `string`  }

##### Defined in

[types.ts:285](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L285)

___

#### StopEvent

Ƭ **StopEvent**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `reason` | ``"error"`` \| ``"normal"`` \| `string` |

##### Defined in

[types.ts:163](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L163)

___

#### Target

Ƭ **Target**: [`SingleTarget`](#singletarget) \| `string`[]

##### Defined in

[types.ts:209](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L209)

___

#### TargetUris

Ƭ **TargetUris**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `uris` | `string`[] |

##### Defined in

[types.ts:210](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L210)

___

#### TimerEvent

Ƭ **TimerEvent**: `Record`<``"name"``, `string`\>

##### Defined in

[types.ts:172](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L172)

___

#### TrackEventParameters

Ƭ **TrackEventParameters**: `Record`<`string`, `Record`<`string`, `string` \| `number` \| `boolean`\>\>

##### Defined in

[types.ts:308](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L308)

___

#### TranscriptionResponse

Ƭ **TranscriptionResponse**: `Record`<``"text"`` \| ``"lang"``, `string`\>

##### Defined in

[types.ts:228](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L228)

___

#### TriggerArgs

Ƭ **TriggerArgs**: `Object`

##### Type declaration

| Name | Type |
| :------ | :------ |
| `source_uri` | `string` |

##### Defined in

[types.ts:88](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L88)

___

#### UnionToIntersection

Ƭ **UnionToIntersection**<`T`\>: `T` extends `any` ? (`x`: `T`) => `any` : `never` extends (`x`: infer R) => `any` ? `R` : `never`

##### Type parameters

| Name |
| :------ |
| `T` |

##### Defined in

[types.ts:24](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L24)

___

#### UnregisterRequest

Ƭ **UnregisterRequest**: `Omit`<[`RegisterRequest`](#registerrequest), ``"expires"``\>

##### Defined in

[types.ts:280](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L280)

___

#### ValueOf

Ƭ **ValueOf**<`T`\>: `T`[keyof `T`]

##### Type parameters

| Name |
| :------ |
| `T` |

##### Defined in

[types.ts:22](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L22)

___

#### WorkflowEventHandlers

Ƭ **WorkflowEventHandlers**: { [EventName in keyof WorkflowEventMappings]?: Function }

##### Defined in

[types.ts:80](https://github.com/relaypro/relay-js/blob/399deba/src/types.ts#L80)


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

Retrieves all of the devices associated with the account.

##### Returns

`string`

the devices.

##### Defined in

[uri.ts:230](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L230)

___

#### allDevicesWithStatus

▸ **allDevicesWithStatus**(`interactionName`, `status`): `string`

Returns a URN containing all of the devices with the specified status.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `interactionName` | `string` | the name of the interaction. |
| `status` | [`InteractionLifecycle`](#interactionlifecycle) | the status of the devices. |

##### Returns

`string`

a URN containing all of the devices with the status.

##### Defined in

[uri.ts:219](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L219)

___

#### assertTargets

▸ **assertTargets**(`target`): `boolean`

Asserts that the specified target URN is valid.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the target URN. |

##### Returns

`boolean`

true if the target URN is valid, throws an 'invalid-target-uris' error otherwise.

##### Defined in

[uri.ts:243](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L243)

___

#### deviceId

▸ **deviceId**(`id`): `string`

Creates a URN from a device ID.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | the ID of the device. |

##### Returns

`string`

the newly constructed URN.

##### Defined in

[uri.ts:204](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L204)

___

#### deviceName

▸ **deviceName**(`name`): `string`

Creates a URN from a device name.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | the name of the device. |

##### Returns

`string`

the newly constructed URN.

##### Defined in

[uri.ts:211](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L211)

___

#### genericOriginator

▸ **genericOriginator**(): `string`

Creates a URN containing server information.

##### Returns

`string`

the newly constructed URN.

##### Defined in

[uri.ts:236](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L236)

___

#### groupId

▸ **groupId**(`id`): `string`

Creates a URN from a group ID.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | the ID of the group. |

##### Returns

`string`

the newly constructed URN.

##### Defined in

[uri.ts:182](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L182)

___

#### groupMember

▸ **groupMember**(`group`, `device`): `string`

Creates a URN for a group member.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `group` | `string` | the name of the group that the device belongs to. |
| `device` | `string` | the device ID or name. |

##### Returns

`string`

the newly constructed URN.

##### Defined in

[uri.ts:197](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L197)

___

#### groupName

▸ **groupName**(`name`): `string`

Creates a URN from a group name.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | the name of the group. |

##### Returns

`string`

the newly constructed URN.

##### Defined in

[uri.ts:189](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L189)

___

#### isInteractionUri

▸ **isInteractionUri**(`uri`): `void`

Checks if the URN is for an interaction.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uri` | `string` | the device URN. |

##### Returns

`void`

##### Defined in

[uri.ts:272](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L272)

___

#### isRelayUri

▸ **isRelayUri**(`uri`): `boolean`

Checks if the URN is a Relay URN.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uri` | `string` | the device, group, or interaction URN. |

##### Returns

`boolean`

true if the URN is a Relay URN, false otherwise.

##### Defined in

[uri.ts:281](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L281)

___

#### makeTargetUris

▸ **makeTargetUris**(`target`): [`TargetUris`](#targeturis)

Creates target URNs and asserts that the targets are valid.  Makes
the target into an array if it isn't already.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | [`Target`](#target) | the target URNs. |

##### Returns

[`TargetUris`](#targeturis)

an array representation of the target URNs.

##### Defined in

[uri.ts:258](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L258)

___

#### parseDeviceId

▸ **parseDeviceId**(`uri`): `string`

Parses out a device ID from a device or interaction URN.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uri` | `string` | the device or interaction URN that you would like to extract the device ID from. |

##### Returns

`string`

the device ID.

##### Defined in

[uri.ts:101](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L101)

___

#### parseDeviceName

▸ **parseDeviceName**(`uri`): `string`

Parses out a device name from a device or interaction URN.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uri` | `string` | the device or interaction URN that you would like to extract the device name from. |

##### Returns

`string`

the device name.

##### Defined in

[uri.ts:87](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L87)

___

#### parseGroupId

▸ **parseGroupId**(`uri`): `string`

Parses out a group ID from a group URN.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uri` | `string` | the URN that you would like to extract the group ID from. |

##### Returns

`string`

the group ID.

##### Defined in

[uri.ts:152](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L152)

___

#### parseGroupName

▸ **parseGroupName**(`uri`): `string`

Parses out a group name from a group URN.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `uri` | `string` | the URN that you would like to extract the group name from. |

##### Returns

`string`

the group name.

##### Defined in

[uri.ts:138](https://github.com/relaypro/relay-js/blob/399deba/src/uri.ts#L138)


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

[utils.ts:44](https://github.com/relaypro/relay-js/blob/399deba/src/utils.ts#L44)

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

[utils.ts:46](https://github.com/relaypro/relay-js/blob/399deba/src/utils.ts#L46)

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

[utils.ts:36](https://github.com/relaypro/relay-js/blob/399deba/src/utils.ts#L36)

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

[utils.ts:86](https://github.com/relaypro/relay-js/blob/399deba/src/utils.ts#L86)

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

[utils.ts:72](https://github.com/relaypro/relay-js/blob/399deba/src/utils.ts#L72)

___

#### makeId

▸ **makeId**(): `string`

##### Returns

`string`

##### Defined in

[utils.ts:32](https://github.com/relaypro/relay-js/blob/399deba/src/utils.ts#L32)

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

[utils.ts:99](https://github.com/relaypro/relay-js/blob/399deba/src/utils.ts#L99)

___

#### noop

▸ **noop**(): `void`

##### Returns

`void`

##### Defined in

[utils.ts:30](https://github.com/relaypro/relay-js/blob/399deba/src/utils.ts#L30)

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

[utils.ts:45](https://github.com/relaypro/relay-js/blob/399deba/src/utils.ts#L45)

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

[utils.ts:48](https://github.com/relaypro/relay-js/blob/399deba/src/utils.ts#L48)


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

[vars.ts:73](https://github.com/relaypro/relay-js/blob/399deba/src/vars.ts#L73)
