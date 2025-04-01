// src/cloudflare/listZones.ts

import axios, { AxiosError } from 'axios'
import { logger } from '../utils/logger'
import { getCloudflareHeaders } from '../utils/cloudflareHeaders'
import { toQueryString } from '../utils/queryString'
import {
  ZoneQueryParams,
  CloudflareZoneListResponse
} from '../types/cloudflare'

export async function listZonesMap(
  query: ZoneQueryParams = {}
): Promise<Record<string, string>> {
  const url = `https://api.cloudflare.com/client/v4/zones${toQueryString(query)}`

  try {
    const res = await axios.get<CloudflareZoneListResponse>(url, {
      headers: getCloudflareHeaders()
    })

    const { success, result, result_info, errors } = res.data

    if (!success) {
      logger.error('[FAILURE] API returned errors')
      logger.error(JSON.stringify(errors, null, 2))
      return {}
    }

    const zoneMap: Record<string, string> = {}
    result.forEach((zone) => {
      zoneMap[zone.name] = zone.id
    })

    logger.info('[SUCCESS] Zone map:')
    logger.info(JSON.stringify(zoneMap, null, 2))

    if (result_info) {
      const { page, per_page, count, total_count } = result_info
      logger.info(
        `Page: ${page} / Items: ${count} / Total: ${total_count} (per_page=${per_page})`
      )
    }

    return zoneMap
  } catch (error) {
    const err = error as AxiosError
    logger.error('[ERROR] Failed to fetch zones')
    if (err.response) {
      logger.error(`Status: ${err.response.status}`)
      logger.error(JSON.stringify(err.response.data, null, 2))
    } else {
      logger.error(err.message)
    }
    return {}
  }
}

// For local test only
if (require.main === module) {
  listZonesMap({
    match: 'all',
    per_page: 50,
    order: 'name'
  }).then(() => {
    logger.info('[DONE] Zone listing complete.')
  })
}
