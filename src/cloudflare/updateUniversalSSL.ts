// src/cloudflare/updateUniversalSSL.ts

import axios from 'axios'
import { getCloudflareHeaders } from '../utils/cloudflareHeaders'
import { logger } from '../utils/logger'
import { CloudflareAPIResponse } from '../types/cloudflare'
import { logAxiosError } from '../utils/logApiError'

export async function updateUniversalSSLCertificateAuthority(
  zoneId: string,
  ca: 'ssl_com' | 'lets_encrypt' | 'google' | 'sectigo'
): Promise<void> {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/universal/settings`
  const payload = { certificate_authority: ca }

  try {
    const res = await axios.patch<CloudflareAPIResponse>(url, payload, {
      headers: getCloudflareHeaders()
    })

    if (res.data.success) {
      logger.info(`[SUCCESS] SSL CA updated to "${ca}"`)
    } else {
      logAxiosError('API error during Universal SSL CA update', res.data.errors)
    }
  } catch (error) {
    logAxiosError('Failed to update Universal SSL CA', error)
  }
}
