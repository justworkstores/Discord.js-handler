import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import logger from '../utils/logger.js';
import { client } from './_sharedClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadCommands(dir = path.join(__dirname, '..', 'commands')) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await loadCommands(full);
      continue;
    }
    if (!entry.name.endsWith('.js')) continue;
    try {
      const mod = await import(full);
      const cmd = mod.default || mod;
      if (!cmd || !cmd.data || !cmd.data.name) {
        logger.warn(`Skipping invalid command file: ${full}`);
        continue;
      }
      client.commands.set(cmd.data.name, cmd);
      if (Array.isArray(cmd.aliases)) {
        for (const alias of cmd.aliases) {
          client.commandAliases.set(alias, cmd.data.name);
        }
      }
      logger.info(`Loaded command ${cmd.data.name}`);
    } catch (err) {
      logger.error(`Failed to load command ${full}:`, err);
    }
  }
}

await loadCommands();
