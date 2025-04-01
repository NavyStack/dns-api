// src/cloudflare/updateCAA.ts

import axios, { AxiosError } from 'axios'
import { logger } from '../utils/logger'
import { cloudflareEnv } from '../utils/cloudflareEnv'
import { getCloudflareHeaders } from '../utils/cloudflareHeaders'
import { CA_LIST } from '../constants/cloudflare'
import { CaaTag, CloudflareAPIResponse } from '../types/cloudflare'

const { ZONE_ID, RECORD_NAME } = cloudflareEnv

if (!ZONE_ID || !RECORD_NAME) {
  throw new Error(
    'Missing required Cloudflare env vars: ZONE_ID or RECORD_NAME'
  )
}

logger.info(`Auth key prefix: ${cloudflareEnv.CLOUDFLARE_API_KEY.slice(0, 10)}`)

async function createCAARecord(ca: string, tag: CaaTag): Promise<void> {
  try {
    const res = await axios.post<CloudflareAPIResponse>(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`,
      {
        type: 'CAA',
        name: RECORD_NAME,
        data: {
          flags: 0,
          tag,
          value: ca
        }
      },
      { headers: getCloudflareHeaders() }
    )

    if (res.data.success) {
      logger.info(`[SUCCESS] ${tag} record added for ${ca}`)
    } else {
      logger.warn(`[WARN] API returned error for ${tag} ${ca}`)
      logger.warn(JSON.stringify(res.data.errors, null, 2))
    }
  } catch (error) {
    const err = error as AxiosError<CloudflareAPIResponse>

    if (err.response?.data?.errors?.some((e) => e.code === 81058)) {
      logger.info(`[SKIP] ${tag} record already exists for ${ca}`)
    } else {
      logger.error(`[ERROR] Failed to add ${tag} for ${ca}`)
      if (err.response) {
        logger.error('Status: ' + err.response.status)
        logger.error(JSON.stringify(err.response.data, null, 2))
      } else {
        logger.error(err.message)
      }
    }
  }
}

async function run(): Promise<void> {
  for (const ca of CA_LIST) {
    await createCAARecord(ca, 'issue')
    await createCAARecord(ca, 'issuewild')
  }
}

run().catch((err) => {
  logger.error('[FATAL] Unexpected error in run()')
  logger.error(err instanceof Error ? err.stack || err.message : String(err))
})
