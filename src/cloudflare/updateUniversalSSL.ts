// src/cloudflare/updateUniversalSSL.ts

import axios, { AxiosError } from 'axios'
import { logger } from '../utils/logger'
import { cloudflareEnv } from '../utils/cloudflareEnv'
import { getCloudflareHeaders } from '../utils/cloudflareHeaders'
import { CloudflareAPIResponse } from '../types/cloudflare'

const { ZONE_ID } = cloudflareEnv

if (!ZONE_ID) {
  throw new Error('Missing required Cloudflare env var: ZONE_ID')
}

export async function updateUniversalSSLCertificateAuthority(
  ca: 'ssl_com' | 'lets_encrypt'
): Promise<void> {
  const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/ssl/universal/settings`

  try {
    const res = await axios.patch<CloudflareAPIResponse>(
      url,
      { certificate_authority: ca },
      { headers: getCloudflareHeaders() }
    )

    if (res.data.success) {
      logger.info(`[SUCCESS] Universal SSL CA updated to "${ca}"`)
    } else {
      logger.error('[FAILURE] API responded with errors')
      logger.error(JSON.stringify(res.data.errors, null, 2))
    }
  } catch (error) {
    const err = error as AxiosError<CloudflareAPIResponse>
    logger.error('[ERROR] Failed to update Universal SSL settings')
    if (err.response) {
      logger.error(`Status: ${err.response.status}`)
      logger.error(JSON.stringify(err.response.data, null, 2))
    } else {
      logger.error(err.message)
    }
  }
}

// Local CLI test
if (require.main === module) {
  updateUniversalSSLCertificateAuthority('ssl_com').catch((err) => {
    logger.error('[FATAL] Unexpected error in SSL update')
    logger.error(err instanceof Error ? err.stack || err.message : String(err))
  })
}
