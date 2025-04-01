// src/utils/logApiError.ts

import { logger } from './logger'
import { AxiosError } from 'axios'
import { CloudflareAPIResponse } from '../types/cloudflare'

export function logAxiosError(label: string, error: unknown): void {
  logger.error(`[ERROR] ${label}`)

  const err = error as AxiosError<CloudflareAPIResponse>
  if (err.response?.data?.errors) {
    logger.error(JSON.stringify(err.response.data.errors, null, 2))
  } else if (err.response) {
    logger.error(`HTTP ${err.response.status}`)
  } else if (err instanceof Error) {
    logger.error(err.stack || err.message)
  } else {
    logger.error(String(error))
  }
}
