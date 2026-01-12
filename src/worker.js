const { Client, GatewayIntentBits, Partials } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./utils/logger');

// Create client with some reasonable defaults. Adjust intents as needed for your bot.
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

async function loadHandlers() {
  const handlersPath = path.join(__dirname, 'handlers');

  // We expect handler modules: commandHandler.js, eventHandler.js, interactionHandler.js
  const files = await fs.readdir(handlersPath);
  const handlerFiles = files.filter(f => f.endsWith('.js'));

  await Promise.all(handlerFiles.map(async file => {
    const modPath = path.join(handlersPath, file);
    try {
      const handler = require(modPath);
      if (typeof handler === 'function') {
        await handler(client);
        logger.info({ handler: file }, 'Loaded handler');
      } else {
        logger.warn({ handler: file }, 'Handler module did not export a function');
      }
    } catch (err) {
      logger.error({ handler: file, err }, 'Failed to load handler');
      throw err;
    }
  }));
}

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    logger.warn('MONGO_URI not provided - skipping database connection');
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      // Options default in modern mongoose versions; add if needed
    });
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error(err, 'Failed to connect to MongoDB');
    throw err;
  }
}

async function shutdown(signal) {
  try {
    logger.info({ signal }, 'Graceful shutdown initiated');
    if (client && client.isReady()) {
      await client.destroy();
      logger.info('Discord client destroyed');
    }
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected');
    }
    process.exit(0);
  } catch (err) {
    logger.error(err, 'Error during shutdown');
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason }, 'Unhandled Rejection at Promise');
});

process.on('uncaughtException', err => {
  logger.fatal(err, 'Uncaught Exception');
  // If possible, try to shut down gracefully
  shutdown('uncaughtException');
});

(async () => {
  try {
    await connectDatabase();
    await loadHandlers();

    const token = process.env.TOKEN;
    if (!token) {
      logger.error('TOKEN environment variable is required to login');
      process.exit(1);
    }

    await client.login(token);
    logger.info('Client logged in');
  } catch (err) {
    logger.error(err, 'Failed to start worker');
    process.exit(1);
  }
})();

module.exports = client;
