import fetch, { Response } from 'node-fetch'
import os from 'os'
import { URLSearchParams } from 'url'

import { Device } from './types'
import { mapDevice } from './utils'
import { vars } from './vars'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require(`../package.json`)

type FetchOptions = {
  method?: string,
  body?: Record<string, never>,
}

class HTTPResponseError extends Error {
  response: Response

  constructor(response: Response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`)
    this.response = response
  }
}

const checkStatus = (response: Response): Response => {
  if (response.ok) {
    return response
  } else {
    throw new HTTPResponseError(response)
  }
}

class RelayApi {

  private subscriberId?: string
  private apiKey?: string
  private accessToken?: string

  constructor(subscriberId?: string, apiKey?: string) {
    this.subscriberId = subscriberId
    this.apiKey = apiKey
  }

  private async refreshToken(): Promise<void> {
    if (!this.apiKey || !this.subscriberId) {
      const err = new Error(`sdk-missing-configuration`)
      err.message = `In order to use the Relay API, initialize the SDK with your API Key and Subscriber Account ID`
      throw err
    }

    const body = new URLSearchParams({
      grant_type: `refresh_token`,
      refresh_token: this.apiKey,
      client_id: vars.authId,
    })

    const response = await fetch(`${vars.authUrl}/oauth2/token`, {
      method: `post`,
      body,
      headers: {
        [`Accept`]: `application/json`,
      },
    })

    const data = await response.json() as Record<string, string>
    this.accessToken = data?.access_token

    if (!this.accessToken) {
      throw new Error(`failed-to-validate-token`)
    }
  }

  private async fetch<T>(path:string, options: FetchOptions = {}, retries = 3): Promise<T> {
    retries--
    if (this.accessToken) {
      const response = await fetch(`${vars.apiUrl}/relaypro/api/v1${path}?subscriber_id=${this.subscriberId}`, {
        method: options.method ?? `get`,
        body: options.body ? JSON.stringify(options.body) : undefined,
        headers: {
          [`Content-Type`]: `application/json`,
          [`Accept`]: `application/json`,
          [`User-Agent`]: `${pkg.name}/${pkg.version} ${os.platform()}-${os.arch()} node-${process.version}`,
          [`Authorization`]: `Bearer ${this.accessToken}`,
        }
      })

      try {
        checkStatus(response)
        return response.json() as Promise<T>
      } catch (err) {
        if (err instanceof HTTPResponseError) {
          if (err.response.status === 401) {
            await this.refreshToken()
            return this.fetch(path, options, retries)
          }
        }
        throw err
      }
    } else {
      await this.refreshToken()
      return this.fetch(path, options, retries)
    }

  }

  async fetchDevice(id: string): Promise<Device> {
    console.warn(`Relay SDK API is currently alpha and may change frequently or be removed`)
    const device = await this.fetch<Record<string, unknown>>(`/device/${id}`)
    return mapDevice(device)
  }
}

export default RelayApi
