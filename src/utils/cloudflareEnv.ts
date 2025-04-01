// src/utils/cloudflareEnv.ts

import * as dotenv from 'dotenv'

dotenv.config()

export const cloudflareEnv = {
  CLOUDFLARE_EMAIL: required('CLOUDFLARE_EMAIL'),
  CLOUDFLARE_API_KEY: required('CLOUDFLARE_API_KEY'),
  ZONE_ID: optional('ZONE_ID'),
  RECORD_NAME: optional('RECORD_NAME')
}

function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

function optional(key: string): string | undefined {
  return process.env[key]
}
