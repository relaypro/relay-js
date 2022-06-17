// Copyright © 2022 Relay Inc.

import fetch, { Response } from 'node-fetch'
import os from 'os'
import { URLSearchParams } from 'url'

import { Device, Target } from './types'
import { mapDevice } from './utils'
import { vars } from './vars'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require(`../package.json`)

type FetchOptions = {
  method?: string,
  body?: Record<string, unknown>,
  query?: Record<string, never>,
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

export default class RelayApi {

  private subscriberId?: string
  private userId?: string
  private apiKey?: string
  private accessToken?: string

  /**
   * @param subscriberId
   * @param apiKey
   * @internal
   */
  constructor(subscriberId?: string, apiKey?: string) {
    this.subscriberId = subscriberId
    this.apiKey = apiKey
  }

  private get defaultQuery() {
    const res: Record<string, string> = {}
    if (this.subscriberId) {
      res.subscriber_id = this.subscriberId
    }
    if (this.userId) {
      res.user_id = this.userId
    }
    return res
  }

  private makeQuery(params?: Record<string, never>): string {
    const query = {
      ...this.defaultQuery,
      ...params
    }

    const value = new URLSearchParams(query).toString()

    if (value) {
      return `?${value}`
    } else {
      return ``
    }
  }

  private async ensureAuthUserId(): Promise<void> {
    if (!this.userId) {
      const response = await fetch(`${vars.authUrl}/oauth2/validate`, {
        headers: {
          [`Authorization`]: `Bearer ${this.accessToken}`,
        }
      })
      checkStatus(response)
      const body = await response.json() as Record<`userid`, string>
      this.userId = body.userid
    }
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

    await this.ensureAuthUserId()
  }

  private async fetch<T>(path:string, options: FetchOptions = {}, retries = 3): Promise<T> {
    retries--
    if (this.accessToken) {
      await this.ensureAuthUserId()
      const response = await fetch(`${vars.apiUrl}${path}${this.makeQuery(options.query)}`, {
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

  private async fetchApi<T>(path: string, options: FetchOptions = {}): Promise<T> {
    return this.fetch(`/relaypro/api/v1${path}`, options)
  }

  private async fetchLegacy<T>(path: string, options: FetchOptions = {}): Promise<T> {
    return this.fetch(`/ibot${path}`, options)
  }

  private apiWarn() {
    console.warn(`Relay SDK API is currently alpha and may change frequently or be removed`)
  }

  async fetchDevice(id: string): Promise<Device> {
    this.apiWarn()
    const device = await this.fetchApi<Record<string, unknown>>(`/device/${id}`)
    return mapDevice(device)
  }

  async triggerWorkflow(id: string, targets: Target, args?: Record<string, string>): Promise<void> {
    this.apiWarn()
    await this.fetchLegacy(`/workflow/${id}`, {
      body: {
        action: `invoke`,
        action_args: args,
        target_device_ids: targets,
      }
    })
  }
}
