const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

module.exports = async (client) => {
  const interactionsPath = path.join(__dirname, '..', 'interactions');
  try {
    const files = await fs.readdir(interactionsPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));

    await Promise.all(jsFiles.map(async file => {
      const filePath = path.join(interactionsPath, file);
      try {
        const interaction = require(filePath);
        if (!interaction || !interaction.name || !interaction.execute) {
          logger.warn({ file }, 'Interaction file missing expected exports (name, execute)');
          return;
        }

        // Example: store interactions in a collection for lookup
        if (!client.interactions) client.interactions = new Map();
        client.interactions.set(interaction.name, interaction);

        logger.debug({ file, interaction: interaction.name }, 'Registered interaction');
      } catch (err) {
        logger.error({ file, err }, 'Failed to load interaction file');
        throw err;
      }
    }));

    logger.info({ count: jsFiles.length }, 'Loaded interactions');
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.warn('No interactions directory found - skipping interaction loading');
      return;
    }
    throw err;
  }
};
