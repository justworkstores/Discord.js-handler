# Discord.js Multipurpose Bot — Optimized ESM Handler

A lightweight, production-oriented ESM handler for a multipurpose Discord bot (slash-only) built on discord.js v14. This repository provides a scalable foundation (sharding-ready) and modular handler system so you can focus on implementing features (tickets, moderation, welcome, etc.).

## Key features
- ESM JavaScript (Node 18+)
- Slash commands only using `SlashCommandBuilder`
- Component handlers: buttons, select menus, and modals
- Sharding via `ShardingManager` (auto or configured)
- Optional Redis-backed shared cooldowns (falls back to in-memory)
- MongoDB support via `mongoose`
- Structured logging with `pino` (pretty output in development)
- Graceful shutdown and global error handlers
- Concurrent handler loading for fast startup
- `deploy-commands.js` script to register slash commands (guild/global)
- Docker, docker-compose, PM2 ecosystem, health endpoint and CI workflow (branch: `docker/pm2-setup`)

---

## Repository layout

- src/
  - commands/          — command files (SlashCommandBuilder exports)
  - events/            — event handlers (name, execute, once?)
  - handlers/          — component handlers (buttons, selects, modals) and handler loaders
  - storage/           — cooldown store (Redis or in-memory)
  - database/          — mongoose connection code
  - models/            — example mongoose models
  - manager.js         — Sharding manager (spawns worker.js)
  - worker.js          — worker process: client, handlers, DB, health server
  - deploy-commands.js — register slash commands (guild or global)
  - health.js          — simple HTTP health endpoint
  - utils/logger.js    — pino logger

---

## Quickstart (local development)

1. Install dependencies

   npm ci

2. Copy `.env.example` → `.env` and fill values (minimum):

   - TOKEN: your bot token (used by manager/worker)
   - CLIENT_ID: your application id (used by deploy script)
   - GUILD_ID: optional — use a guild id for fast command registration during development
   - MONGO_URI: optional but recommended for persistence
   - REDIS_URL: optional — set to enable shared cooldowns and job queues across shards
   - NODE_ENV, LOG_LEVEL, TOTAL_SHARDS

3. Deploy commands (recommended to test in a dev guild)

   Set `GUILD_ID` in `.env` for instant propagation, then run:

   node src/deploy-commands.js

   - For global registration, unset `GUILD_ID` (global changes may take up to 1 hour).

4. Start the bot

   - Recommended (production / multiple shards):
     npm run manager

   - Single worker (development):
     npm run start

5. Health check

   - The worker exposes a small health server at `/health` on the port defined by `HEALTH_PORT` (default 3000):

     curl http://localhost:3000/health

---

## Handlers and how to add code

Commands
- Create files under `src/commands/` that export a `data` object (SlashCommandBuilder) and an `execute(interaction)` function.
- Example structure:
  ```js
  export default {
    data: new SlashCommandBuilder().setName('ping').setDescription('Replies with pong'),
    cooldown: 5,
    aliases: ['p'],
    async execute(interaction) { ... }
  };
  ```
- `deploy-commands.js` reads these files and registers commands with Discord. Use `aliases` sparingly — each alias becomes a separate slash command when deployed by the script.

Events
- Place event modules in `src/events/`. Each should export `name`, `execute`, and optionally `once`.

Components (buttons, selects, modals)
- Create handlers under `src/handlers/buttons`, `src/handlers/selects`, `src/handlers/modals`.
- Each handler should export `{ id, execute }` where handlers are looked up by prefix-matching the interaction `customId`.

Shared client
- Handlers import the shared client accessor at `src/handlers/_sharedClient.js` or `globalThis.__client` which is set by the worker on ready.

Cooldowns
- The scaffold uses `src/storage/cooldownStore.js` which will connect to Redis if `REDIS_URL` is provided; otherwise it falls back to in-memory TTL.
- Use the cooldown mechanism in your command code by defining a numeric `cooldown` property (in seconds) on the command export.

---

## Docker / PM2 / docker-compose

A `docker/pm2-setup` branch contains Docker and orchestration files. The included `Dockerfile`, `docker-compose.yml`, and `ecosystem.config.cjs` let you quickly run the app, Redis, and Mongo locally.

Build and run with Docker Compose (local testing):

  docker-compose up -d --build

The container exposes the health endpoint at port `3000` by default.

PM2
- For production, run the manager under a process supervisor. The repository includes `ecosystem.config.cjs` to run the manager via PM2.

---

## Production recommendations

1. Use managed database services
   - MongoDB: MongoDB Atlas or a managed provider for reliability and backups.
   - Redis: use a managed Redis (for shared cooldowns, job queues, and pub/sub).

2. Use REDIS_URL in production when running multiple shards to ensure shared cooldowns and distributed jobs work correctly.

3. Monitor and log
   - Ship pino JSON logs to a log aggregator (Papertrail, Datadog, ELK).
   - Add a metrics exporter or health checks for alerting.

4. Use job queues for scheduled tasks
   - For temp mutes/unbans or delayed tasks, use a Redis-backed queue (BullMQ) or a worker process that reads expirations from MongoDB.

5. Shard sizing and resources
   - Calculate `TOTAL_SHARDS` according to your guild count (Discord recommends ~2.5k guilds per shard historically, but test for your bot).
   - Monitor memory per worker and scale hosts accordingly.

---

## Troubleshooting

- Bot not logging in: verify `TOKEN` and that the bot is invited to at least one guild.
- Commands not showing: ensure `CLIENT_ID` and `GUILD_ID` (for guild deploy) are set correctly and run `node src/deploy-commands.js`.
- Redis not connecting: check `REDIS_URL` and network access.
- Health endpoint returns DB disconnected: ensure `MONGO_URI` is set and reachable.

---

## License
MIT

End of README content.
