import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import logger from '../utils/logger.js';
import { client } from './_sharedClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadEvents(dir = path.join(__dirname, '..', 'events')) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await loadEvents(full);
      continue;
    }
    if (!entry.name.endsWith('.js')) continue;
    try {
      const mod = await import(full);
      const evt = mod.default || mod;
      if (!evt || !evt.name || !evt.execute) {
        logger.warn(`Skipping invalid event file: ${full}`);
        continue;
      }
      if (evt.once) {
        client.once(evt.name, (...args) => evt.execute(client, ...args));
      } else {
        client.on(evt.name, (...args) => evt.execute(client, ...args));
      }
      logger.info(`Bound event ${evt.name}`);
    } catch (err) {
      logger.error(`Failed to load event ${full}:`, err);
    }
  }
}

await loadEvents();
