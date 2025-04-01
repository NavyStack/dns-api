// src/cloudflare/updateSSLRecommendation.ts

import axios from 'axios'
import { getCloudflareHeaders } from '../utils/cloudflareHeaders'
import { logger } from '../utils/logger'
import { logAxiosError } from '../utils/logApiError'
import { cloudflareLimiter } from '../utils/limiter'
import { CloudflareAPIResponse } from '../types/cloudflare'

/**
 * Sets SSL recommendation mode to "strict" for the given zone.
 */
export async function setSSLRecommendationStrict(
  zoneId: string
): Promise<void> {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/recommendation`
  const payload = { value: 'strict' }

  await cloudflareLimiter(async () => {
    try {
      const res = await axios.patch<CloudflareAPIResponse>(url, payload, {
        headers: getCloudflareHeaders()
      })

      if (res.data.success) {
        logger.info(
          `[SSL][SUCCESS] SSL recommendation set to "strict" for ${zoneId}`
        )
      } else {
        logAxiosError(
          '[SSL][FAIL] Failed to set SSL recommendation mode',
          res.data.errors
        )
      }
    } catch (error) {
      logAxiosError(
        '[SSL][ERROR] Exception while setting SSL recommendation mode',
        error
      )
    }
  })
}
