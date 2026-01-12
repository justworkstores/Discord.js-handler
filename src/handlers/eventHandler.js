import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import logger from '../utils/logger.js';
import { client } from './_sharedClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadEvents(dir = path.join(__dirname, '..', 'events')) {
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
        const evt = mod.default || mod;
        if (!evt || !evt.name || !evt.execute) {
          logger.warn(`Skipping invalid event file: ${full}`);
          return;
        }
        if (evt.once) client.once(evt.name, (...args) => evt.execute(client, ...args));
        else client.on(evt.name, (...args) => evt.execute(client, ...args));
        logger.info(`Bound event ${evt.name}`);
      } catch (err) {
        logger.error(`Failed to load event ${full}:`, err);
      }
    }));
  } catch (err) {
    logger.debug('No events directory or failed to read events:', err.message);
  }
}

await loadEvents();
