import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import logger from '../utils/logger.js';
import { client } from './_sharedClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadCommands(dir = path.join(__dirname, '..', 'commands')) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const sub = await fs.readdir(path.join(dir, entry.name), { withFileTypes: true });
        for (const s of sub) if (s.name.endsWith('.js')) files.push(path.join(dir, entry.name, s.name));
      } else if (entry.name.endsWith('.js')) files.push(path.join(dir, entry.name));
    }
    await Promise.all(files.map(async full => {
      try {
        const mod = await import(full);
        const cmd = mod.default || mod;
        if (!cmd || !cmd.data || !cmd.data.name) {
          logger.warn(`Skipping invalid command file: ${full}`);
          return;
        }
        client.commands.set(cmd.data.name, cmd);
        if (Array.isArray(cmd.aliases)) for (const alias of cmd.aliases) client.commandAliases.set(alias, cmd.data.name);
        logger.info(`Loaded command ${cmd.data.name}`);
      } catch (err) {
        logger.error(`Failed to load command ${full}:`, err);
      }
    }));
  } catch (err) {
    logger.debug('No commands directory or failed to read commands:', err.message);
  }
}

await loadCommands();
