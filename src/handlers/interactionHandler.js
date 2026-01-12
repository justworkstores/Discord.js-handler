import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import logger from '../utils/logger.js';
import { client } from './_sharedClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadDirIntoCollection(root, collection) {
  try {
    const dir = path.join(__dirname, '..', root);
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.name.endsWith('.js')) continue;
      const full = path.join(dir, ent.name);
      try {
        const mod = await import(full);
        const h = mod.default || mod;
        if (!h || !h.id || !h.execute) {
          logger.warn(`Skipping invalid handler ${full}`);
          continue;
        }
        collection.set(h.id, h);
        logger.info(`Loaded ${root} handler ${h.id}`);
      } catch (err) {
        logger.error(`Failed to load handler ${full}:`, err);
      }
    }
  } catch (err) {
    logger.debug(`No ${root} directory found or failed to read it: ${err.message}`);
  }
}

await Promise.all([
  loadDirIntoCollection('handlers/buttons', client.buttons),
  loadDirIntoCollection('handlers/selects', client.selects),
  loadDirIntoCollection('handlers/modals', client.modals)
]);
