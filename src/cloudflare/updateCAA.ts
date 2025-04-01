// src/cloudflare/updateCAA.ts

import axios, { AxiosError } from 'axios'
import { CA_LIST } from '../types/cloudflare'
import { getCloudflareHeaders } from '../utils/cloudflareHeaders'
import { logger } from '../utils/logger'
import { CaaTag, CloudflareAPIResponse } from '../types/cloudflare'

export async function createCAARecords(
  zoneId: string,
  recordName: string
): Promise<void> {
  const tasks = CA_LIST.flatMap((ca) => [
    addCaaRecord(zoneId, recordName, ca, 'issue'),
    addCaaRecord(zoneId, recordName, ca, 'issuewild')
  ])
  await Promise.allSettled(tasks)
}

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
      logger.info(`[ADD] ${tag} CAA for ${ca} → ${name}`)
    } else {
      logApiErrors(
        `[WARN] Failed to add ${tag} CAA for ${ca} → ${name}`,
        res.data.errors
      )
    }
  } catch (error) {
    const err = error as AxiosError<CloudflareAPIResponse>
    const apiErrors = err.response?.data?.errors

    if (apiErrors?.some((e) => e.code === 81058)) {
      logger.info(`[SKIP] ${tag} CAA already exists for ${ca} → ${name}`)
    } else {
      logger.error(`[ERROR] Failed to add ${tag} CAA for ${ca} → ${name}`)
      if (apiErrors) {
        logApiErrors(null, apiErrors)
      } else {
        logger.error(err.message)
      }
    }
  }
}

function logApiErrors(context: string | null, errors: unknown): void {
  if (context) logger.warn(context)
  logger.warn(JSON.stringify(errors, null, 2))
}
