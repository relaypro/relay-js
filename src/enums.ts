export enum Event {
  ERROR = `error`,
  START = `start`,
  STOP = `stop`,
  BUTTON = `button`,
  TIMER = `timer`,
  NOTIFICATION = `notification`,
  INCIDENT = `incident`,
  PROMPT_START = `prompt_start`,
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
  POLISH = `ko-KR`,
  PORTUGUESE = `pt-BR`,
  NORWEIGN = `nb-NO`,
  DUTCH = `nl-NL`,
  CHINESE = `zh`,
}

export enum DeviceInfoQuery {
  NAME = `name`,
  ID = `id`,
  ADDRESS = `address`,
  COORDINATES = `latlong`,
  BATTERY = `battery`,
  INDOOR_LOCATION = `indoor_location`,
  LOCATION = `location`,
}

export enum DeviceInfoField {
  LABEL = `label`,
  CHANNEL = `channel`,
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
