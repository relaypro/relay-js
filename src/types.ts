import http from 'http'
import https from 'https'
import { WebSocket } from 'ws'

import {
  Button,
  CallDirection,
  IncidentStatus,
  NotificationPriority,
  NotificationSound,
  Taps,
  Event as EventEnum,
} from './enums'

import { RelayEventAdapter } from './index'

export type ValueOf<T> = T[keyof T]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never

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
  // api: RelayApi,
}


type WorkflowEventMappings = {
  [EventEnum.ERROR]: ErrorEvent,
  [EventEnum.START]: StartEvent,
  [EventEnum.STOP]: StopEvent,
  [EventEnum.INTERACTION_LIFECYCLE]: InteractionLifecycleEvent,
  [EventEnum.INTERACTION_STARTED]: InteractionLifecycleEvent,
  [EventEnum.INTERACTION_RESUMED]: InteractionLifecycleEvent,
  [EventEnum.INTERACTION_SUSPENDED]: InteractionLifecycleEvent,
  [EventEnum.INTERACTION_ENDED]: InteractionLifecycleEvent,
  [EventEnum.INTERACTION_FAILED]: InteractionLifecycleEvent,
  [EventEnum.BUTTON]: ButtonEvent,
  [EventEnum.TIMER]: TimerEvent,
  [EventEnum.NOTIFICATION]: NotificationEvent,
  [EventEnum.INCIDENT]: IncidentEvent,
  [EventEnum.SPEECH]: SpeechEvent,
  [EventEnum.PROMPT]: PromptEvent,
  [EventEnum.CALL_RINGING]: RingingCallEvent,
  [EventEnum.CALL_CONNECTED]: ConnectedCallEvent,
  [EventEnum.CALL_DISCONNECTED]: DisconnectedCallEvent,
  [EventEnum.CALL_FAILED]: FailedCallEvent,
  [EventEnum.CALL_RECEIVED]: ReceivedCallEvent,
  [EventEnum.CALL_START_REQUEST]: StartedCallEvent,
}

export type WorkflowEvent = ValueOf<WorkflowEventMappings>
export type RawWorkflowEvent = UnionToIntersection<WorkflowEvent> & {
  _type: string,
  _id: string,
}

export type WorkflowEventHandlers = {
  [EventName in keyof WorkflowEventMappings]?: (event: WorkflowEventMappings[EventName]) => Promise<void>
}


// START TRIGGERS
// Triggers are passed to the `wf_api_start_event` handler

export type TriggerArgs = {
  source_uri: string,
}

export type PhraseTrigger = {
  type: `phrase`,
  args: TriggerArgs & {
    phrase: string,
    spillover: string,
  }
}

export type ButtonTrigger = {
  type: `button`,
  args: TriggerArgs & {
    action: `action_button_single_tap`|`action_button_double_tap`|`action_button_triple_tap`,
  }
}

export type HttpTrigger = {
  type: `http`,
  args: TriggerArgs & {
    args: Record<string, string>,
  }
}

export type NfcTrigger = {
  type: `nfc`,
  args: TriggerArgs & {
    uid: string,
    nfc_payload: Record<string, string>,
  }
}

// emergency, other, calendar, geofence, and telephony
export type OtherTrigger = {
  type: `emergency` | `other` | `calendar` | `geofence` | `telephony`,
  args: TriggerArgs,
}

// END TRIGGERS

// START INTERACTIONS

// type InteractionLifecycleEventType = `started`|`resumed`|`suspended`|`ended`|`failed`

export type InteractionLifecycleEvent = Event & {
  reason?: string,
  // TODO: InteractionLifecycleEventType TypeScript error because of narrowing of IncidentEvent `type`
  //       Need to figure out
  type: string,
}

export type InteractionLifecycle = `started`|`resumed`|`suspended`|`ended`|`failed`

// END INTERACTIONS

// START EVENTS

type Event = {
  source_uri: string,
}

/**
 * ErrorEvent is not emitted from Relay Platform. Rather it is emitted from
 * the SDK when an exception goes unhandled by user code.
 */
export type ErrorEvent = {
  error: Error,
}

export type StartEvent = {
  trigger: PhraseTrigger | ButtonTrigger | HttpTrigger | NfcTrigger | OtherTrigger,
}

export type StopEvent = {
  reason: `error` | `normal` | string
}

export type ButtonEvent = Event & {
  button: Button,
  taps: Taps,
}

export type TimerEvent = Record<`name`, string>

export type NotificationEvent = Event & {
  event: string,
  name: string,
  notification_state: NotificationState,
}

export type SpeechEvent = Event & {
  request_id: string,
  text: string,
  audio: string,
  lang: string,
}

// export type PromptEventType = `started`|`stopped`|`failed`

export type PromptEvent = Event & {
  id: string,
  // TODO: PromptEventType TypeScript error because of narrowing of IncidentEvent `type`
  //       Need to figure out
  type: string,
}

export type AnyEvent = Error

export type IncidentEvent = {
  type: IncidentStatus,
  incident_id: string,
  reason: string,
}

// END EVENTS

// START TARGET
export type SingleTarget = string
export type Target = SingleTarget | string[]
export type TargetUris = { uris: string[] }
// END TARGET

export type InputType = `action_button_single_tap`
  | `action_button_double_tap`
  | `action_button_triple_tap`
  | `action_button_long_press`
  | `channel_button_double_tap`
  | `channel_button_triple_tap`

export type HomeChannelBehavior = `suspend`|`normal`

export type InteractionOptions = {
  color?: string,
  input_types?: [InputType],
  home_channel?: HomeChannelBehavior,
}

export type TranscriptionResponse = Record<`text`|`lang`, string>
export type AudioResponse = Record<`audio`, string>

export type ListenResponse = TranscriptionResponse | AudioResponse

export type AnyPrimitive = undefined | symbol | string | boolean | number | [string|boolean|number]

export type Mapper<Type> = (value: string) => Type

// START LEDS

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

// END LEDS

// START NOTIFICATIONS

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

// END NOTIFICATIONS

// START CALL EVENTS

export type RegisterRequest = {
  uri?: string,
  password?: string,
  expires?: number,
}

export type UnregisterRequest = Omit<RegisterRequest, `expires`>

export type BaseCallEvent = {
  call_id: string
}
export type StartedCallEvent = BaseCallEvent & {
  uri: string,
}
export type PlaceCall = Partial<Omit<StartedCallEvent, `call_id`>>
export type ReceivedCallEvent = StartedCallEvent & {
  start_time_epoch: number,
  direction: CallDirection,
  onnet: boolean,
}
export type RingingCallEvent = ReceivedCallEvent
export type ProgressingCallEvent = ReceivedCallEvent
export type ConnectedCallEvent = ReceivedCallEvent & {
  connect_time_epoch: number,
}
export type DisconnectedCallEvent = ConnectedCallEvent & {
  reason: string,
  end_time_epoch: number,
}
export type FailedCallEvent = DisconnectedCallEvent
export type Call = StartedCallEvent | ReceivedCallEvent | ConnectedCallEvent | DisconnectedCallEvent | FailedCallEvent

// END CALL EVENTS

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
