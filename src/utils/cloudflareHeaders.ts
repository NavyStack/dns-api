// src/utils/cloudflareHeaders.ts

import { cloudflareEnv } from './cloudflareEnv'

export function getCloudflareHeaders(): Record<string, string> {
  return {
    'X-Auth-Email': cloudflareEnv.CLOUDFLARE_EMAIL,
    'X-Auth-Key': cloudflareEnv.CLOUDFLARE_API_KEY,
    'Content-Type': 'application/json'
  }
}
