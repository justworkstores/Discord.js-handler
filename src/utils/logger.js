const pino = require('pino');

const isDev = process.env.NODE_ENV !== 'production';

let logger;
if (isDev) {
  // Simple pretty output in development
  logger = pino({
    level: process.env.LOG_LEVEL || 'debug',
    transport: {
      target: 'pino-pretty',
      options: { colorize: true }
    }
  });
} else {
  logger = pino({ level: process.env.LOG_LEVEL || 'info' });
}

module.exports = logger;
