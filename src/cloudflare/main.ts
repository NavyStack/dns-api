// src/cloudflare/main.ts

import {
  listZonesMap,
  createCAARecords,
  updateUniversalSSLCertificateAuthority
} from './zoneManager'
import { logger } from '../utils/logger'

async function main(): Promise<void> {
  const zoneMap = await listZonesMap()

  if (Object.keys(zoneMap).length === 0) {
    logger.error('[ERROR] No zones returned from Cloudflare API')
    return
  }

  for (const [domain, zoneId] of Object.entries(zoneMap)) {
    logger.info(`\n[PROCESSING] ${domain} (${zoneId})`)

    try {
      await createCAARecords(zoneId, domain)
      await updateUniversalSSLCertificateAuthority(zoneId, 'ssl_com')
    } catch (err) {
      logger.error(`[ERROR] Failed processing ${domain}`)
      logger.error(
        err instanceof Error ? err.stack || err.message : String(err)
      )
    }
  }

  logger.info('\n✅ All zones processed.')
}

main().catch((err) => {
  logger.error('[FATAL] Uncaught error in main')
  logger.error(err instanceof Error ? err.stack || err.message : String(err))
})
