// src/cloudflare/updateTieredCache.ts

import axios from 'axios'
import { getCloudflareHeaders } from '../utils/cloudflareHeaders'
import { logger } from '../utils/logger'
import { logAxiosError } from '../utils/logApiError'
import { cloudflareLimiter } from '../utils/limiter'
import { CloudflareAPIResponse } from '../types/cloudflare'

/**
 * Enables Tiered Cache Smart Topology for the specified zone.
 */
export async function enableTieredCacheSmartTopology(
  zoneId: string
): Promise<void> {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/cache/tiered_cache_smart_topology_enable`
  const payload = { value: 'on' }

  await cloudflareLimiter(async () => {
    try {
      const res = await axios.patch<CloudflareAPIResponse>(url, payload, {
        headers: getCloudflareHeaders()
      })

      if (res.data.success) {
        logger.info(
          `[CACHE][SUCCESS] Tiered Cache Smart Topology enabled for ${zoneId}`
        )
      } else {
        logAxiosError(
          '[CACHE][FAIL] API responded with error while enabling Tiered Cache Smart Topology',
          res.data.errors
        )
      }
    } catch (error) {
      logAxiosError(
        '[CACHE][ERROR] Failed to enable Tiered Cache Smart Topology',
        error
      )
    }
  })
}
