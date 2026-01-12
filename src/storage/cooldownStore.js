import logger from '../utils/logger.js';

let redisClient;
let inMemory = null;

export async function initCooldownStore() {
  const url = process.env.REDIS_URL;
  if (url) {
    try {
      const Redis = (await import('ioredis')).default;
      redisClient = new Redis(url);
      redisClient.on('error', (e) => logger.error({ e }, 'Redis error'));
      await redisClient.ping();
      logger.info('Connected to Redis for cooldowns');
      return {
        has: async (key) => {
          const v = await redisClient.get(key);
          return v !== null;
        },
        set: async (key, ttlSec) => redisClient.set(key, '1', 'EX', ttlSec)
      };
    } catch (err) {
      logger.warn('Failed to init Redis, falling back to memory store', err.message);
    }
  }
  // Fallback: in-memory map with expirations
  inMemory = new Map();
  return {
    has: async (key) => {
      const t = inMemory.get(key);
      if (!t) return false;
      if (Date.now() > t) { inMemory.delete(key); return false; }
      return true;
    },
    set: async (key, ttlSec) => { inMemory.set(key, Date.now() + ttlSec * 1000); }
  };
}
