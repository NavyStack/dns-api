// src/cloudflare/listZones.ts

import axios from 'axios'
import { getCloudflareHeaders } from '../utils/cloudflareHeaders'
import { toQueryString } from '../utils/queryString'
import { logger } from '../utils/logger'
import { CloudflareZoneListResponse } from '../types/cloudflare'
import { logAxiosError } from '../utils/logApiError'

export async function listZonesMap(): Promise<Record<string, string>> {
  const url = `https://api.cloudflare.com/client/v4/zones${toQueryString({
    match: 'all',
    per_page: 50,
    order: 'name'
  })}`

  try {
    const res = await axios.get<CloudflareZoneListResponse>(url, {
      headers: getCloudflareHeaders()
    })

    const { success, result, errors } = res.data

    if (!success) {
      logAxiosError('Cloudflare API returned error when listing zones', errors)
      return {}
    }

    const zoneMap = Object.fromEntries(result.map((z) => [z.name, z.id]))
    logger.info('[SUCCESS] Retrieved zone map')
    return zoneMap
  } catch (error) {
    logAxiosError('Failed to fetch zone list', error)
    return {}
  }
}
