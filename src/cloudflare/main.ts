// src/cloudflare/main.ts

import { listZonesMap } from './listZones'
import { createCAARecords } from './updateCAA'
import { updateUniversalSSLCertificateAuthority } from './updateUniversalSSL'
import { logger } from '../utils/logger'
import { logAxiosError } from '../utils/logApiError'

async function main(): Promise<void> {
  const zoneMap = await listZonesMap()
  if (Object.keys(zoneMap).length === 0) {
    logger.error('[FATAL] No zones returned from Cloudflare API')
    process.exit(1)
  }

  const failed: string[] = []

  const tasks = Object.entries(zoneMap).map(async ([domain, zoneId]) => {
    logger.info(`[PROCESSING] ${domain} (${zoneId})`)
    try {
      await createCAARecords(zoneId, domain)
      await updateUniversalSSLCertificateAuthority(zoneId, 'ssl_com')
      logger.info(`[DONE] ${domain}`)
    } catch (err) {
      failed.push(domain)
      logger.error(`[FAILED] ${domain}`)
      logAxiosError(`Failed processing ${domain}`, err)
    }
  })

  await Promise.allSettled(tasks)

  logger.info(
    `✅ Zones processed: ${Object.keys(zoneMap).length - failed.length}`
  )
  logger.info(`❌ Failed zones: ${failed.length}`)
  if (failed.length > 0) {
    logger.warn(`❗ Failed domains: ${failed.join(', ')}`)
  }
}

main().catch((err) => {
  logger.error('[FATAL] Uncaught error in main')
  logger.error(err instanceof Error ? err.stack || err.message : String(err))
})
