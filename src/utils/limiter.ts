// src/utils/limiter.ts

import pLimit from 'p-limit'

/**
 * Global concurrency limiter to avoid Cloudflare API rate limits.
 * Max 4 req/sec → safe concurrency set to 2~3
 */
export const cloudflareLimiter = pLimit(1)
export const domainLimiter = pLimit(10)
