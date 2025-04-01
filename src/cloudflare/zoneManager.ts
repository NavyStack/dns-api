// src/cloudflare/zoneManager.ts

import axios, { AxiosError } from 'axios'
import { logger } from '../utils/logger'
import { CA_LIST } from '../constants/cloudflare'
import { getCloudflareHeaders } from '../utils/cloudflareHeaders'
import { toQueryString } from '../utils/queryString'
import {
  CloudflareZoneListResponse,
  CloudflareAPIResponse
} from '../types/cloudflare'

type CaaTag = 'issue' | 'issuewild'

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

    if (!res.data.success) {
      logger.error('[FAILURE] listZonesMap error:')
      logger.error(JSON.stringify(res.data.errors, null, 2))
      return {}
    }

    const map: Record<string, string> = {}
    for (const zone of res.data.result) {
      map[zone.name] = zone.id
    }

    logger.info('[SUCCESS] Retrieved zone map')
    return map
  } catch (error) {
    const err = error as AxiosError
    logger.error('[ERROR] listZonesMap failed')
    if (err.response) {
      logger.error(JSON.stringify(err.response.data, null, 2))
    } else {
      logger.error(err.message)
    }
    return {}
  }
}

export async function createCAARecords(
  zoneId: string,
  recordName: string
): Promise<void> {
  for (const ca of CA_LIST) {
    await createCAARecord(zoneId, recordName, ca, 'issue')
    await createCAARecord(zoneId, recordName, ca, 'issuewild')
  }
}

async function createCAARecord(
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
      logger.info(`[ADD] ${tag} CAA for ${ca} → ${name}`)
    } else {
      logger.warn(`[WARN] API returned errors for ${tag} ${ca} → ${name}`)
      logger.warn(JSON.stringify(res.data.errors, null, 2))
    }
  } catch (error) {
    const err = error as AxiosError<CloudflareAPIResponse>

    if (err.response?.data?.errors?.some((e) => e.code === 81058)) {
      logger.info(`[SKIP] ${tag} CAA already exists for ${ca} → ${name}`)
    } else {
      logger.error(`[ERROR] Failed to add ${tag} CAA for ${ca} → ${name}`)
      if (err.response) {
        logger.error(JSON.stringify(err.response.data, null, 2))
      } else {
        logger.error(err.message)
      }
    }
  }
}

export async function updateUniversalSSLCertificateAuthority(
  zoneId: string,
  ca: 'ssl_com' | 'lets_encrypt'
): Promise<void> {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/universal/settings`

  try {
    const res = await axios.patch<CloudflareAPIResponse>(
      url,
      { certificate_authority: ca },
      { headers: getCloudflareHeaders() }
    )

    if (res.data.success) {
      logger.info(`[SUCCESS] SSL CA updated to "${ca}"`)
    } else {
      logger.error('[FAILURE] SSL CA update error')
      logger.error(JSON.stringify(res.data.errors, null, 2))
    }
  } catch (error) {
    const err = error as AxiosError<CloudflareAPIResponse>
    logger.error('[ERROR] Failed to update Universal SSL CA')
    if (err.response) {
      logger.error(JSON.stringify(err.response.data, null, 2))
    } else {
      logger.error(err.message)
    }
  }
}
