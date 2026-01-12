import 'dotenv/config';
import { ShardingManager } from 'discord.js';
import { fileURLToPath } from 'url';
import path from 'path';
import logger from './utils/logger.js';

const token = process.env.TOKEN;
if (!token) {
  logger.error('TOKEN env var missing – cannot spawn shards');
  process.exit(1);
}

const workerPath = fileURLToPath(new URL('./worker.js', import.meta.url));

const manager = new ShardingManager(workerPath, {
  token,
  totalShards: process.env.TOTAL_SHARDS || 'auto',
  respawn: true
});

manager.on('shardCreate', shard => logger.info(`Launched shard ${shard.id}`));
manager.on('shardError', (shardId, error) => logger.error({ shardId, error }, 'Shard error'));

(async () => {
  try {
    const shards = await manager.spawn();
    logger.info(`Spawned ${shards.size} shards`);
  } catch (err) {
    logger.error({ err }, 'Failed to spawn shards');
    process.exit(1);
  }
})();
