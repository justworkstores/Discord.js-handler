import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import connectDatabase from './database/mongoose.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// Expose client early so handlers can access it via _sharedClient
globalThis.__client = client;

// Collections
client.commands = new Collection();
client.commandAliases = new Collection();
client.cooldowns = new Collection();
client.buttons = new Collection();
client.selects = new Collection();
client.modals = new Collection();

// Load handlers
const handlersPath = path.join(__dirname, 'handlers');
try {
  const handlerFiles = await fs.readdir(handlersPath);
  for (const file of handlerFiles) {
    if (file.endsWith('.js')) {
      await import(path.join(handlersPath, file));
      logger.info(`Loaded handler ${file}`);
    }
  }
} catch (err) {
  logger.warn('Handlers directory missing or unreadable:', err.message);
}

await connectDatabase();

client.once('ready', () => {
  logger.info(`Logged in as ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN).catch(err => {
  logger.error('Failed to login:', err);
});
