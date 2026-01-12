import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];

async function readCommands(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      await readCommands(full);
    } else if (ent.name.endsWith('.js')) {
      const mod = await import(full);
      const cmd = mod.default || mod;
      if (!cmd || !cmd.data) continue;
      commands.push(cmd.data.toJSON());
      if (Array.isArray(cmd.aliases) && cmd.aliases.length > 0) {
        for (const alias of cmd.aliases) {
          const clone = JSON.parse(JSON.stringify(cmd.data.toJSON()));
          clone.name = alias;
          clone.description = `[alias for /${cmd.data.name}] ${clone.description || ''}`.trim();
          commands.push(clone);
        }
      }
    }
  }
}

(async () => {
  try {
    const commandsPath = path.join(__dirname, 'commands');
    await readCommands(commandsPath);

    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

    if (process.env.GUILD_ID) {
      logger.info(`Registering ${commands.length} commands to guild ${process.env.GUILD_ID}`);
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      logger.info('Successfully registered guild commands.');
    } else {
      logger.info(`Registering ${commands.length} global commands`);
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      logger.info('Successfully registered global commands (may take up to 1 hour to propagate).');
    }
  } catch (error) {
    logger.error('Error deploying commands:', error);
  }
})();
