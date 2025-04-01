// src/types/cloudflare.ts

/**
 * Represents a Cloudflare zone.
 */
export interface Zone {
  id: string
  name: string
  status: string
}

/**
 * Query parameters for Cloudflare zone API.
 */
export interface CloudflareZoneQueryParams {
  account_id?: string
  account_name?: string
  name?: string
  match?: 'any' | 'all'
  status?: 'initializing' | 'pending' | 'active' | 'moved'
  order?: 'name' | 'status' | 'account.id' | 'account.name'
  direction?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

/**
 * Represents an error from the Cloudflare API.
 */
export interface CloudflareAPIError {
  code: number
  message: string
}

/**
 * Standard response from the Cloudflare API.
 */
export interface CloudflareAPIResponse {
  success: boolean
  errors: CloudflareAPIError[]
}

/**
 * Response from listing Cloudflare zones.
 */
export interface CloudflareZoneListResponse {
  success: boolean
  errors: CloudflareAPIError[]
  messages?: CloudflareAPIError[]
  result: Zone[]
  result_info?: {
    page: number
    per_page: number
    count: number
    total_count: number
  }
}

/**
 * Type for CAA record tags.
 */
export type CaaTag = 'issue' | 'issuewild'

/**
 * List of certificate authorities.
 */
export const CA_LIST = [
  'amazon.com',
  'amazontrust.com',
  'awstrust.com',
  'amazonaws.com',
  'pki.goog; cansignhttpexchanges=yes',
  'letsencrypt.org',
  'ssl.com',
  'sectigo.com',
  'comodoca.com',
  'digicert.com',
  'geotrust.com',
  'symantec.com',
  'thawte.com',
  'globalsign.com'
]
