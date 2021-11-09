import http from 'http'
import https from 'https'

import WebSocket from 'ws'
import RelayApi from './api'
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
  server?: http.Server | https.Server,
  subscriberId?: string,
  apiKey?: string,
}

export type LocalWebSocket = WebSocket & {
  connectionId: string,
  isAlive: boolean,
}

export interface Workflow {
  (relay: RelayEventAdapter): void
}

export interface Relay {
  workflow: (path: string|Workflow, workflow?: Workflow) => void,
  api: RelayApi,
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

export type UnregisterRequest = Omit<RegisterRequest, `expires`>

export type BaseCall = {
  call_id: string
}
export type StartedCall = BaseCall & {
  device_id: string,
  device_name: string,
  uri: string,
}
export type PlaceCall = Partial<Omit<StartedCall, `call_id`>>
export type ReceivedCall = StartedCall & {
  start_time_epoch: number,
  direction: CallDirection,
  onnet: boolean,
}
export type RingingCall = ReceivedCall
export type ProgressingCall = ReceivedCall
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

export type TrackEventParameters = Record<string, Record<string, string|number|boolean>>

export type Device = {
  name: string,
  active_channel: string,
  emergency_info: never,
  background_audio: boolean,
  mode: null | `emergency_sos` | `dnd`,
  device_status: `online` | `offline`,
  last_connect_timestamp: string,
  battery_level: number,
  battery_status: `charging` | `discharging`,
  rom_version: string,
  app_version: string,
  build_id: string,
  product_name: string,
  model: string,
  wifi_mac: string,
  volume_level: number,
  imei: string,
  iccid: string,
  fcc_id: string,
  ic_id: string,
  connection_type: `cell` | `wifi`,
  wifi_signal: number,
  cell_signal: number,
  bluetooth_status: `on` | `off`,
  bluetooth_address: string,
  bluetooth_name: string,
  location: {
    lat: number,
    long: number,
    accuracy: number,
    address: string | null,
    date: string,
    geofence_state: `outside` | `inside` | null,
    geofence_id: string | null,
    geofence_events: {
      timestamp_z: string,
      type: `entry` | `exit`,
      geofence_id: string,
      label: string
    }[],
    indoor_position: {
      best: number,
      best_match: string[],
      best_match_id: string,
      best_match_mac: string,
      best_match_venue: string,
    }
  },
  groups: {
    group_id: string,
    name: string,
  }[],
  rendezvous: never[],
  features: {
    calling_notifications: boolean,
    use_ibot_transcriptions: false,
    home_channel_timeout: number,
    sensors_enabled: string[],
    home_channel_name: string,
    auto_dnd_when_charging: boolean,
    calling: boolean,
    indoor_positioning: boolean,
    background_notification_repeat_interval: number,
    foreground_notification_repeat_interval: number,
    location_polling_interval: number,
    ping_interval: number,
    prefer_cell: boolean,
    enable_event_stream: boolean,
    indoor_position_algorithm: string,
    cache_wifi_for_location: boolean,
    location: boolean,
    background_audio: boolean,
    sos: boolean,
    dnd: boolean,
  },
  capabilities: {
    enable_audit_logs: boolean,
    escalated_sos: boolean,
    group_transcriptions: boolean,
    group_translations: boolean,
    sos: boolean,
    devmon_event_support: boolean,
    dnd: boolean,
    eavesdrop_support: boolean,
    enable_team_support: boolean,
    intent_support: boolean,
    sip_register_support: boolean,
    calling_between_devices_support: boolean,
    allow_sos_override: boolean,
    group_persistence: boolean,
    audit_rich_logging: boolean,
    calling: boolean,
    geofencing: boolean,
    indoor_positioning: boolean,
    virtual_device_location_reporting: boolean,
    location_history: boolean,
    location: boolean,
    ui_allow_incident_resolution: boolean,
    background_audio: boolean,
    low_latency_audio: boolean
  },
  channels: {
    channel_id: string,
    name: string,
    type: string,
    catalog_type: string,
    force_switch_on_page: boolean,
    is_hidden: boolean,
    color: string,
    params: Record<string, string>,
  }[]
}
