import pino from 'pino';
const isDev = process.env.NODE_ENV !== 'production';
export default pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev ? { target: 'pino-pretty' } : undefined
});
