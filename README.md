# Discord.js Handler

A lightweight, production-friendly boilerplate/handler for discord.js with optional sharding support, concurrent handler loading, graceful shutdown, and structured logging via pino.

This repository focuses on the process-level architecture (manager + worker) and improved handler loading patterns.

Features
- Lightweight sharding using discord.js ShardingManager
- Worker process that creates the Discord Client, loads handlers concurrently, connects to MongoDB, and handles graceful shutdown
- Global error handlers for unhandled rejections and uncaught exceptions
- pino logger for structured logs (with pretty output in development)
- Concurrent handler loading for commands, events, and interactions

Quickstart
1. Clone the repo
   git clone git@github.com:justworkstores/Discord.js-handler.git
2. Install dependencies
   npm install
3. Set environment variables (at minimum):
   - TOKEN - Discord bot token
   - MONGO_URI - (optional) MongoDB connection string
4. Start in manager (recommended for multiple shards):
   npm run manager

5. Or start a single worker (useful for development or single-shard deployments):
   npm run start:single

Sharding

This project includes a simple manager/worker split.

- manager (src/manager.js)
  - Uses discord.js's ShardingManager to spawn worker processes automatically (totalShards: 'auto').
  - The manager script expects the TOKEN environment variable to be set.
  - It spawns worker processes which run src/worker.js.

- worker (src/worker.js)
  - Creates a discord.js Client and logs in using process.env.TOKEN.
  - Concurrently loads handlers from src/handlers (commands, events, interactions).
  - Optionally connects to MongoDB if MONGO_URI is provided.
  - Registers global error handlers for unhandledRejection and uncaughtException.
  - Implements graceful shutdown on SIGINT/SIGTERM.

Notes on scaling
- This sharding approach is lightweight and relies on the Node process manager to spawn independent worker processes. The ShardingManager coordinates shard assignment with Discord.
- For large-scale deployments you may wish to configure spawn options, respawn behavior, or use a process manager like PM2 or Kubernetes on top of this pattern.

Logging
- Uses pino for structured, high-performance logging.
- In development (NODE_ENV !== 'production') the logger will use pino-pretty for readable console output; otherwise it logs plain JSON.

Handler conventions
- Commands: src/commands/*.js should export { data, execute } where data has a .name property.
- Events: src/events/*.js should export { name, once?, execute }
- Interactions: src/interactions/*.js should export { name, execute }

License
MIT
