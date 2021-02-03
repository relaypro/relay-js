export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080
export const HEARTBEAT = process.env.HEARTBEAT ? parseInt(process.env.HEARTBEAT) : 30000
export const STRICT_PATH = process.env.STRICT_PATH ?? `1`

export const TIMEOUT = 5000
export const REFRESH_TIMEOUT = 45000
