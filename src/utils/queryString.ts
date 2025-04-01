// src/utils/queryString.ts

export function toQueryString(
  params: Record<string, string | number | undefined>
): string {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
    )
    .join('&')
  return query ? `?${query}` : ''
}
