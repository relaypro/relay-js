// Copyright © 2022 Relay Inc.

/**
 * Different events that can happen during a workflow, including
 * an error, interaction lifecycle events, button presses, timers
 * or notificaions, incidents, speech, and calls.
 */
export enum Event {
  ERROR = `error`,
  START = `start`,
  STOP = `stop`,
  INTERACTION_LIFECYCLE = `interaction_lifecycle`,
  INTERACTION_STARTED = `interaction_started`,
  INTERACTION_RESUMED = `interaction_resumed`,
  INTERACTION_SUSPENDED = `interaction_suspended`,
  INTERACTION_ENDED = `interaction_ended`,
  INTERACTION_FAILED = `interaction_failed`,
  BUTTON = `button`,
  TIMER = `timer`,
  TIMER_FIRED = `timer_fired`,
  NOTIFICATION = `notification`,
  INCIDENT = `incident`,
  PROMPT = `prompt`,
  SPEECH = `speech`,
  CALL_RINGING = `call_ringing`,
  CALL_CONNECTED = `call_connected`,
  CALL_DISCONNECTED = `call_disconnected`,
  CALL_FAILED = `call_failed`,
  CALL_RECEIVED = `call_received`,
  CALL_START_REQUEST = `call_start_request`,
}

/**
 * Specifies whether a call is inbound or outbound.
 */
export enum CallDirection {
  INBOUND = `inbound`,
  OUTBOUND = `outbound`,
}

/**
 * Whether the button press was on the action button, or
 * the channel button.
 */
export enum Button {
  ACTION = `action`,
  CHANNEL = `channel`,
}

/**
 * The number of times a user consequtively taps a button, or the
 * user holds down a button.
 */
export enum Taps {
  SINGLE = `single`,
  DOUBLE = `double`,
  TRIPLE = `triple`,
  LONG = `long`,
}

/**
 * The supported languages that can be used for speech, listening,
 * or translation on the device.
 */
export enum Language {
  ENGLISH = `en-US`,
  GERMAN = `de-DE`,
  SPANISH = `es-ES`,
  FRENCH = `fr-FR`,
  ITALIAN = `it-IT`,
  RUSSIAN = `ru-RU`,
  SWEDISH = `sv-SE`,
  TURKISH = `tr-TR`,
  HINDI = `hi-IN`,
  ICELANDIC = `is-IS`,
  JAPANESE = `ja-JP`,
  KOREAN = `ko-KR`,
  POLISH = `pl-PK`,
  PORTUGUESE = `pt-BR`,
  NORWEGIAN = `nb-NO`,
  DUTCH = `nl-NL`,
  CHINESE = `zh`,
  ARABIC = `ar`,
  VIETNAMESE = `vi-VN`,
  INDONESIAN = `id-ID`,
  FILIPINO = `fil-PH`,
  DANISH = `da-DK`,
  CZECH = `cs-CZ`,
  GUJURATI = `gu-IN`,
  HUNGARIAN = `hu-HU`,
  TAMIL = `ta-IN`,
  UKRANIAN = `uk-UA`,
  SLOVAK = `sk-SK`,
  ROMANIAN = `ro-RO`,
  PUNJABI = `pa-IN`,
  MALAY = `ms-MY`,
  BENGALI = `bn-IN`,
  GREEK = `el-GR`,
  KANNADA = `kn-IN`,
  FINNISH = `fi-FI`,
}

/**
 * Information dealing with the device name, id, type,
 * location, battery, and username.
 */
export enum DeviceInfoQuery {
  NAME = `name`,
  ID = `id`,
  TYPE = `type`,
  ADDRESS = `address`,
  COORDINATES = `latlong`,
  BATTERY = `battery`,
  INDOOR_LOCATION = `indoor_location`,
  LOCATION = `location`,
  USERNAME = `username`,
  LOCATION_ENABLED = `location_enabled`,
}

/**
 * Information fields on the device.
 */
export enum DeviceInfoField {
  LABEL = `label`,
  CHANNEL = `channel`,
  LOCATION_ENABLED = `location_enabled`,
}

/**
 * The device type, including the Relay Dash or app.
 */
export enum DeviceType {
  RELAY = `relay`,
  RELAY2 = `relay2`,
  RELAY_APP = `relay_app`,
  ROIP = `roip`,
  DASH = `dash`,
}

/**
 * The different types of notifications that can be sent, including
 * cancelling a notification.
 */
export enum Notification {
  BROADCAST = `broadcast`,
  ALERT = `alert`,
  NOTIFY = `notify`,
  CANCEL = `cancel`,
}

/**
 * The state of an incident indicating whether it has been resolved or cancelled.
 */
export enum IncidentStatus {
  RESOLVED = `resolved`,
  CANCELLED = `cancelled`,
}

/**
 * The priority of a notification.  Includes normal, critical, or high priority.
 */
export enum NotificationPriority {
  NORMAL = `normal`,
  HIGH = `high`,
  CRITICAL = `critical`,
}

/**
 * The sound of a notification.  Can be either default or SOS.
 */
export enum NotificationSound {
  DEFAULT = `default`,
  SOS = `sos`,
}

/**
 * The type of timer on the device.  Can be a timeout or interval timer type.
 */
export enum TimerType {
  TIMEOUT = `timeout`,
  INTERVAL = `interval`,
}

/**
 * The timeout type for a timer.  Can be either milliseconds, seconds, minutes, or hours.
 */
export enum TimeoutType {
  MILLISECONDS = `ms`,
  SECONDS = `secs`,
  MINUTES = `mins`,
  HOURS = `hrs`,
}
