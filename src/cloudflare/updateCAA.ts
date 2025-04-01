// src/cloudflare/updateCAA.ts

import axios from 'axios'
import {
  CA_LIST,
  CaaTag,
  CloudflareAPIResponse,
  CloudflareAPIError
} from '../types/cloudflare'
import { getCloudflareHeaders } from '../utils/cloudflareHeaders'
import { logger } from '../utils/logger'
import { cloudflareLimiter } from '../utils/limiter'
/**
 * Retry wrapper with exponential backoff.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 5,
  delayMs = 500
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const code = err.response?.data?.[0]?.code

        if (status === 429 || code === 971) {
          const wait = delayMs * 2 ** attempt
          logger.warn(`[RETRY] Rate limit hit. Retrying after ${wait}ms...`)
          await new Promise((resolve) => setTimeout(resolve, wait))
          continue
        }
      }
      throw err
    }
  }
  throw new Error('Exceeded maximum retries due to rate limiting.')
}

/**
 * Creates CAA records for the given domain using all CA_LIST entries.
 */
export async function createCAARecords(
  zoneId: string,
  recordName: string
): Promise<void> {
  const tasks = CA_LIST.flatMap((ca) => [
    cloudflareLimiter(() =>
      withRetry(() => addCaaRecord(zoneId, recordName, ca, 'issue'))
    ),
    cloudflareLimiter(() =>
      withRetry(() => addCaaRecord(zoneId, recordName, ca, 'issuewild'))
    )
  ])

  await Promise.allSettled(tasks)
}

/**
 * Adds a single CAA record.
 */
async function addCaaRecord(
  zoneId: string,
  name: string,
  ca: string,
  tag: CaaTag
): Promise<void> {
  try {
    const res = await axios.post<CloudflareAPIResponse>(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
      {
        type: 'CAA',
        name,
        data: {
          flags: 0,
          tag,
          value: ca
        }
      },
      { headers: getCloudflareHeaders() }
    )

    if (res.data.success) {
      logger.info(`[CAA][ADD] ${tag} → ${ca} (${name})`)
    } else {
      logApiErrors(`[CAA][FAIL] ${tag} → ${ca} (${name})`, res.data.errors)
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const apiErrors = err.response?.data?.errors

      if (apiErrors?.some((e: CloudflareAPIError) => e.code === 81058)) {
        logger.info(`[CAA][SKIP] ${tag} already exists for ${ca} (${name})`)
      } else {
        logger.error(`[CAA][ERROR] Failed to add ${tag} → ${ca} (${name})`)
        logApiErrors(null, apiErrors)
      }
    } else {
      logger.error(`[CAA][ERROR] Unexpected error for ${tag} → ${ca} (${name})`)
      logger.error(String(err))
    }

    throw err // rethrow for withRetry
  }
}

/**
 * Logs Cloudflare API errors.
 */
function logApiErrors(
  context: string | null,
  errors: CloudflareAPIError[] | unknown
): void {
  if (context) logger.warn(context)
  logger.warn(JSON.stringify(errors, null, 2))
}
