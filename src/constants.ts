export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080
export const HEARTBEAT = process.env.HEARTBEAT ? parseInt(process.env.HEARTBEAT) : 30000

export const TIMEOUT = 5000
export const EVENT_TIMEOUT = 32000
export const REFRESH_TIMEOUT = 45000
export const NOTIFICATION_TIMEOUT = 60000

export const ERROR_RESPONSE = `wf_api_error_response`

// workflow actions that require an interaction target
export const NON_INTERACTIVE_ACTIONS = [
  `notification`,
  `set_channel`,
  `set_home_channel_state`,
  `set_device_mode`,
  `start_interaction`,
  `end_interaction`,
  `get_device_info`,
  `set_device_info`,
  `set_user_profile`,
  `inbox_count`,
  `device_power_off`,
  `call`,
  `answer`,
  `hangup`,
  `register`,
  `play`,
]
