// src/cloudflare/updateUniversalSSL.ts

import axios from 'axios'
import { getCloudflareHeaders } from '../utils/cloudflareHeaders'
import { logger } from '../utils/logger'
import { logAxiosError } from '../utils/logApiError'
import { cloudflareLimiter } from '../utils/limiter'
import { CloudflareAPIResponse } from '../types/cloudflare'

type CertificateAuthority = 'ssl_com' | 'lets_encrypt' | 'google' | 'sectigo'

/**
 * Updates the Universal SSL certificate authority for the specified zone.
 */
export async function updateUniversalSSLCertificateAuthority(
  zoneId: string,
  ca: CertificateAuthority
): Promise<void> {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/universal/settings`
  const payload = { certificate_authority: ca }

  await cloudflareLimiter(async () => {
    try {
      const res = await axios.patch<CloudflareAPIResponse>(url, payload, {
        headers: getCloudflareHeaders()
      })

      if (res.data.success) {
        logger.info(`[SSL][SUCCESS] CA updated to "${ca}" for zone ${zoneId}`)
      } else {
        logAxiosError(
          '[SSL][FAIL] API response indicates failure',
          res.data.errors
        )
      }
    } catch (error) {
      logAxiosError('[SSL][ERROR] Failed to update Universal SSL CA', error)
    }
  })
}
