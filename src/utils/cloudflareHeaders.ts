// src/utils/cloudflareHeaders.ts

import { cloudflareEnv } from './env'

/**
 * Returns Cloudflare API headers required for authentication.
 *
 * @returns {Record<string, string>} An object containing the necessary headers.
 */
export function getCloudflareHeaders(): Record<string, string> {
  return {
    'X-Auth-Email': cloudflareEnv.CLOUDFLARE_EMAIL,
    'X-Auth-Key': cloudflareEnv.CLOUDFLARE_API_KEY,
    'Content-Type': 'application/json'
  }
}
