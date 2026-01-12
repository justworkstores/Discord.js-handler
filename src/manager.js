const { ShardingManager } = require('discord.js');
const logger = require('./utils/logger');

const path = require('path');
const token = process.env.TOKEN;

if (!token) {
  logger.error('TOKEN environment variable is required to spawn shards.');
  process.exit(1);
}

const manager = new ShardingManager(path.join(__dirname, 'worker.js'), {
  token,
  totalShards: 'auto'
});

manager.on('shardCreate', shard => {
  logger.info({ shard: shard.id }, `Spawned shard ${shard.id}`);
});

(async () => {
  try {
    const shards = await manager.spawn();
    logger.info({ count: shards.length }, 'All shards spawned');
  } catch (err) {
    logger.error(err, 'Failed to spawn shards');
    process.exit(1);
  }
})();
