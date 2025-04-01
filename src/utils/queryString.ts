// src/utils/queryString.ts

/**
 * Converts an object to a query string.
 *
 * @param {Record<string, string | number | undefined>} params - An object representing query parameters.
 * @returns {string} The resulting query string starting with '?' if parameters exist, otherwise an empty string.
 */
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
