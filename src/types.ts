import http from 'http'
import https from 'https'

import WebSocket from 'ws'
import { Button, CallDirection, IncidentStatus, NotificationPriority, NotificationSound, Taps } from './enums'
import { RelayEventAdapter } from './index'

export type AnyPrimitive = undefined | symbol | string | boolean | number | [string|boolean|number]

export type Mapper<Type> = (value: string) => Type

export type LedIndex = `ring`|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|`1`|`2`|`3`|`4`|`5`|`6`|`7`|`8`|`9`|`10`|`11`|`12`|`13`|`14`|`15`|`16`
export type LedEffect = `off` | `breathe`| `flash` | `rotate` | `rainbow` | `static`
export type LedInfo = {
  rotations?: number,
  count?: number,
  duration?: number,
  repeat_delay?: number,
  pattern_repeats?: number,
  colors?: {
    [K in LedIndex]?: string
  }
}

export type Msg = {
  _id: string,
  _type: string,
  error?: string,
  button?: string,
  taps?: string,
  source?: string,
  name?: string,
  event?: string,
  notification_state?: string,
}

export type Options = {
  server?: http.Server | https.Server
}

export type LocalWebSocket = WebSocket & {
  connectionId: string,
  isAlive: boolean,
}

export interface Workflow {
  (relay: RelayEventAdapter): void
}

export interface Relay {
  workflow: (path: string|Workflow, workflow?: Workflow) => void
}

export type StopEvent = {
  reason: `error` | `normal` | string
}

export type ButtonEvent = {
  button: Button,
  taps: Taps,
}

export type NotificationOptions = {
  priority: NotificationPriority,
  title: string,
  body: string,
  sound: NotificationSound,
}

export type NotificationState = {
  acknowledged: string[],
  created: string[],
  cancelled: string[],
  timed_out: string[],
}

export type NotificationEvent = {
  source: string,
  event: string,
  name: string,
  notification_state: NotificationState,
}

export type RegisterRequest = {
  uri?: string,
  password?: string,
  expires?: number,
}

export type BaseCall = {
  call_id: string
}
export type StartedCall = BaseCall & {
  device_id: string,
  device_name: string,
}
export type PlaceCall = Partial<Omit<StartedCall, `call_id`>>
export type ReceivedCall = StartedCall & {
  start_time_epoch: number,
  direction: CallDirection,
}
export type RingingCall = ReceivedCall
export type ConnectedCall = ReceivedCall & {
  connect_time_epoch: number,
}
export type DisconnectedCall = ConnectedCall & {
  reason: string,
  end_time_epoch: number,
}
export type FailedCall = DisconnectedCall
export type Call = StartedCall | ReceivedCall | ConnectedCall | DisconnectedCall | FailedCall

export type IncidentEvent = {
  type: IncidentStatus,
  incident_id: string,
  reason: string,
}

export type Prompt = {
  id: string,
}
