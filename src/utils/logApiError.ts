// src/utils/logApiError.ts

import axios from 'axios'
import { logger } from './logger'
import { CloudflareAPIResponse } from '../types/cloudflare'

/**
 * Logs errors from Axios requests in a consistent format.
 *
 * @param {string} label - A descriptive label for the error.
 * @param {unknown} error - The error object to log.
 */
export function logAxiosError(label: string, error: unknown): void {
  logger.error(`[ERROR] ${label}`)

  if (axios.isAxiosError<CloudflareAPIResponse>(error)) {
    const apiErrors = error.response?.data?.errors
    if (apiErrors) {
      logger.error(JSON.stringify(apiErrors, null, 2))
    } else if (error.response) {
      logger.error(`HTTP ${error.response.status}`)
    } else {
      logger.error(error.message)
    }
  } else if (error instanceof Error) {
    logger.error(error.stack || error.message)
  } else {
    logger.error(String(error))
  }
}
