// src/cloudflare/main.ts

import '../config'
import { listZonesMap } from './listZones'
import { createCAARecords } from './updateCAA'
import { updateUniversalSSLCertificateAuthority } from './updateUniversalSSL'
import { enableTieredCacheSmartTopology } from './updateTieredCache'
// import { setSSLRecommendationStrict } from './updateSSLRecommendation'
import { logger } from '../utils/logger'
import { logAxiosError } from '../utils/logApiError'

/**
 * Processes a single domain: adds CAA records and updates SSL CA.
 */
async function processZone(domain: string, zoneId: string): Promise<boolean> {
  logger.info(`[ZONE][PROCESSING] ${domain} (${zoneId})`)
  try {
    await createCAARecords(zoneId, domain)
    await updateUniversalSSLCertificateAuthority(zoneId, 'ssl_com')
    await enableTieredCacheSmartTopology(zoneId)
    // await setSSLRecommendationStrict(zoneId)
    logger.info(`[ZONE][DONE] ${domain}`)
    return true
  } catch (err) {
    logger.error(`[ZONE][FAILED] ${domain}`)
    logAxiosError(`Failed processing zone: ${domain}`, err)
    return false
  }
}

/**
 * Logs summary of zone processing.
 */
function logSummary(total: number, failed: string[]): void {
  const successCount = total - failed.length
  logger.info(`[MAIN] ✅ Zones processed: ${successCount}`)
  logger.info(`[MAIN] ❌ Failed zones: ${failed.length}`)

  if (failed.length > 0) {
    logger.warn(`[MAIN] ❗ Failed domains: ${failed.join(', ')}`)
  }
}

/**
 * Main entry point for processing Cloudflare zones.
 */
async function main(): Promise<void> {
  const zoneMap = await listZonesMap()
  const zones = Object.entries(zoneMap)

  if (zones.length === 0) {
    logger.error('[MAIN][FATAL] No zones returned from Cloudflare API')
    process.exit(1)
  }

  const failed: string[] = []

  for (const [domain, zoneId] of zones) {
    const success = await processZone(domain, zoneId)
    if (!success) failed.push(domain)
  }

  logSummary(zones.length, failed)
}

main().catch((err: unknown) => {
  logger.error('[MAIN][FATAL] Uncaught error in main')
  logger.error(err instanceof Error ? err.stack || err.message : String(err))
})
