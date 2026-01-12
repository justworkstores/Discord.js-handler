import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import connectDatabase from './database/mongoose.js';
import logger from './utils/logger.js';
import { initCooldownStore } from './storage/cooldownStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal intents for slash-only + component interactions
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Expose client to handler modules
globalThis.__client = client;

client.commands = new Collection();
client.commandAliases = new Collection();
client.cooldowns = new Collection();
client.buttons = new Collection();
client.selects = new Collection();
client.modals = new Collection();

let cooldownStore;

// Global error handlers & graceful shutdown
process.on('unhandledRejection', (err) => logger.error({ err }, 'Unhandled Rejection'));
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception');
  process.exit(1);
});

async function shutdown(signal) {
  logger.info(`Shutting down (signal=${signal})`);
  try {
    await client.destroy();
    await import('./database/mongoose.js').then(m => m.disconnect && m.disconnect());
  } catch (err) {
    logger.error({ err }, 'Error during shutdown');
  } finally {
    process.exit(0);
  }
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

async function loadHandlers() {
  const handlersDir = path.join(__dirname, 'handlers');
  try {
    const files = await fs.readdir(handlersDir);
    // import all handler modules concurrently
    await Promise.all(files.filter(f => f.endsWith('.js')).map(f => import(path.join(handlersDir, f))));
    logger.info('Loaded handler modules');
  } catch (err) {
    logger.warn('No handlers loaded or handlers dir missing:', err.message);
  }
}

(async () => {
  try {
    cooldownStore = await initCooldownStore();
    await connectDatabase();
    await loadHandlers();

    // load commands, events, interactions (handlers will populate client collections)
    // For back-compat, handlers like commandHandler.js will run on import

    await client.login(process.env.TOKEN);
    logger.info(`Logged in as ${client.user.tag}`);
  } catch (err) {
    logger.error({ err }, 'Worker failed to start');
    process.exit(1);
  }
})();
