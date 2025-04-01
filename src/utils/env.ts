// src/utils/env.ts

/**
 * Environment variables for Cloudflare configuration.
 */
export const cloudflareEnv = {
  CLOUDFLARE_EMAIL: required('CLOUDFLARE_EMAIL'),
  CLOUDFLARE_API_KEY: required('CLOUDFLARE_API_KEY'),
  ZONE_ID: optional('ZONE_ID'),
  RECORD_NAME: optional('RECORD_NAME')
}

/**
 * Retrieves a required environment variable.
 *
 * @param {string} key - The environment variable key.
 * @returns {string} The value of the environment variable.
 * @throws {Error} If the environment variable is not set.
 */
function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

/**
 * Retrieves an optional environment variable.
 *
 * @param {string} key - The environment variable key.
 * @returns {string | undefined} The value of the environment variable or undefined if not set.
 */
function optional(key: string): string | undefined {
  return process.env[key]
}
