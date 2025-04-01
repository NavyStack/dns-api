// src/types/cloudflare.d.ts

export interface Zone {
  id: string
  name: string
  status: string
}

export interface ZoneQueryParams {
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

export interface CloudflareAPIError {
  code: number
  message: string
}

export interface CloudflareAPIResponse {
  success: boolean
  errors: CloudflareAPIError[]
}

export interface CloudflareZoneListResponse {
  success: boolean
  errors: CloudflareAPIError[]
  messages: CloudflareAPIError[]
  result: Zone[]
  result_info?: {
    page: number
    per_page: number
    count: number
    total_count: number
  }
}

export type CaaTag = 'issue' | 'issuewild'

export interface CloudflareAPIError {
  code: number
  message: string
}

export interface CloudflareAPIResponse {
  success: boolean
  errors: CloudflareAPIError[]
}

// src/types/cloudflare.ts

export interface Zone {
  id: string
  name: string
  status: string
}

export interface CloudflareZoneListResponse {
  success: boolean
  errors: { code: number; message: string }[]
  result: Zone[]
  result_info?: {
    page: number
    per_page: number
    count: number
    total_count: number
  }
}

export interface CloudflareAPIError {
  code: number
  message: string
}

export interface CloudflareAPIResponse {
  success: boolean
  errors: CloudflareAPIError[]
}
