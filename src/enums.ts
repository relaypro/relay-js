// Copyright © 2022 Relay Inc.

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

export enum CallDirection {
  INBOUND = `inbound`,
  OUTBOUND = `outbound`,
}

export enum Button {
  ACTION = `action`,
  CHANNEL = `channel`,
}

export enum Taps {
  SINGLE = `single`,
  DOUBLE = `double`,
  TRIPLE = `triple`,
  LONG = `long`,
}

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

export enum DeviceInfoField {
  LABEL = `label`,
  CHANNEL = `channel`,
  LOCATION_ENABLED = `location_enabled`,
}

export enum DeviceType {
  RELAY = `relay`,
  RELAY2 = `relay2`,
  RELAY_APP = `relay_app`,
  ROIP = `roip`,
  DASH = `dash`,
}

export enum Notification {
  BROADCAST = `broadcast`,
  ALERT = `alert`,
  NOTIFY = `notify`,
  CANCEL = `cancel`,
}

export enum IncidentStatus {
  RESOLVED = `resolved`,
  CANCELLED = `cancelled`,
}

export enum NotificationPriority {
  NORMAL = `normal`,
  HIGH = `high`,
  CRITICAL = `critical`,
}

export enum NotificationSound {
  DEFAULT = `default`,
  SOS = `sos`,
}

export enum TimerType {
  TIMEOUT = `timeout`,
  INTERVAL = `interval`,
}

export enum TimeoutType {
  MILLISECONDS = `ms`,
  SECONDS = `secs`,
  MINUTES = `mins`,
  HOURS = `hrs`,
}
