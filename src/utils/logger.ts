// src/utils/logger.ts

import { createLogger, format, transports } from 'winston'

const { combine, timestamp, printf, colorize } = format

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] ${message}`
})

const consoleFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  colorize(),
  logFormat
)

const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  logFormat
)

/**
 * Logger instance configured for application-wide logging.
 */
export const logger = createLogger({
  level: 'info',
  format: fileFormat,
  transports: [
    new transports.Console({
      format: consoleFormat
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new transports.File({
      filename: 'logs/combined.log'
    })
  ]
})
