const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

module.exports = async (client) => {
  const eventsPath = path.join(__dirname, '..', 'events');
  try {
    const files = await fs.readdir(eventsPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));

    await Promise.all(jsFiles.map(async file => {
      const filePath = path.join(eventsPath, file);
      try {
        const event = require(filePath);
        if (!event || !event.name || !event.execute) {
          logger.warn({ file }, 'Event file missing expected exports (name, execute)');
          return;
        }

        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }

        logger.debug({ file, event: event.name }, 'Registered event');
      } catch (err) {
        logger.error({ file, err }, 'Failed to load event file');
        throw err;
      }
    }));

    logger.info({ count: jsFiles.length }, 'Loaded events');
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.warn('No events directory found - skipping event loading');
      return;
    }
    throw err;
  }
};
