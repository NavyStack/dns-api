// src/cloudflare/listZones.ts

import axios from 'axios'
import { getCloudflareHeaders } from '../utils/cloudflareHeaders'
import { toQueryString } from '../utils/queryString'
import { logger } from '../utils/logger'
import { logAxiosError } from '../utils/logApiError'
import { CloudflareZoneListResponse } from '../types/cloudflare'

/**
 * Retrieves a mapping of Cloudflare zone names to their IDs.
 *
 * @returns {Promise<Record<string, string>>} A record where keys are zone names and values are zone IDs.
 */
export async function listZonesMap(): Promise<Record<string, string>> {
  const query = toQueryString({
    match: 'all',
    per_page: 50,
    order: 'name'
  })

  const url = `https://api.cloudflare.com/client/v4/zones${query}`

  try {
    const res = await axios.get<CloudflareZoneListResponse>(url, {
      headers: getCloudflareHeaders()
    })

    const { success, result, errors } = res.data

    if (!success) {
      logAxiosError('Cloudflare API returned error when listing zones', errors)
      return {}
    }

    const zoneMap = Object.fromEntries(
      result.map((zone) => [zone.name, zone.id])
    )
    logger.info('[ZONE] Successfully retrieved zone map')
    return zoneMap
  } catch (error) {
    logAxiosError('Failed to fetch zone list', error)
    return {}
  }
}
