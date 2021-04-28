import http from 'http'
import https from 'https'

import WebSocket from 'ws'
import { Button, IncidentStatus, NotificationPriority, NotificationSound, Taps } from './enums'
import { RelayEventAdapter } from './index'

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

export interface Msg {
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

export interface Options {
  server?: http.Server | https.Server
}

export interface LocalWebSocket extends WebSocket {
  connectionId: string,
  isAlive: boolean,
}

export interface Workflow {
  (relay: RelayEventAdapter): void
}

export interface Relay {
  workflow: (path: string, workflow: Workflow) => void
}

export interface ButtonEvent {
  button: Button,
  taps: Taps,
}

export interface NotificationOptions {
  priority: NotificationPriority,
  title: string,
  body: string,
  sound: NotificationSound,
}

export interface NotificationState {
  acknowledged: string[],
  created: string[],
  cancelled: string[],
  timed_out: string[],
}

export interface NotificationEvent {
  source: string,
  event: string,
  name: string,
  notification_state: NotificationState,
}

export interface BaseCall {
  call_id: string
}
export interface StartedCall extends BaseCall {
  device_id: string,
  device_name: string,
}
export interface ReceivedCall extends StartedCall {
  direction: string,
}
export interface ConnectedCall extends ReceivedCall {
  start_time_epoch: number,
  connect_time_epoch: number,
}
export interface DisconnectedCall extends ConnectedCall {
  reason: string,
  end_time_epoch: number,
}
export type FailedCall = DisconnectedCall
export type Call = StartedCall | ReceivedCall | ConnectedCall | DisconnectedCall | FailedCall

export interface IncidentEvent {
  type: IncidentStatus,
  incident_id: string,
  reason: string,
}
