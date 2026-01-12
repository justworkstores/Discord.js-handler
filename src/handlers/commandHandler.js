const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

module.exports = async (client) => {
  const commandsPath = path.join(__dirname, '..', 'commands');
  try {
    const files = await fs.readdir(commandsPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));

    await Promise.all(jsFiles.map(async file => {
      const filePath = path.join(commandsPath, file);
      try {
        const cmd = require(filePath);
        if (!cmd || !cmd.data || !cmd.execute) {
          logger.warn({ file }, 'Command file missing expected exports (data, execute)');
          return;
        }
        if (!client.commands) client.commands = new Map();
        client.commands.set(cmd.data.name, cmd);
        logger.debug({ file, name: cmd.data.name }, 'Registered command');
      } catch (err) {
        logger.error({ file, err }, 'Failed to load command file');
        throw err;
      }
    }));

    logger.info({ count: jsFiles.length }, 'Loaded commands');
  } catch (err) {
    // If directory doesn't exist, warn but don't crash
    if (err.code === 'ENOENT') {
      logger.warn('No commands directory found - skipping command loading');
      return;
    }
    throw err;
  }
};
