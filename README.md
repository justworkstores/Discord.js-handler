# Discord.js Multipurpose Bot — Optimized ESM Handler

This repo provides a lightweight, optimized, ESM-based handler for a multipurpose Discord bot using discord.js v14.

Features
- ESM JavaScript (Node 18+)
- Slash commands only
- Component handlers: buttons, select menus, modals
- Sharding via ShardingManager
- Optional Redis-backed shared cooldowns (REDIS_URL)
- MongoDB (mongoose)
- pino structured logging
- Concurrent handler loading and graceful shutdown
- Auto-deploy script for slash commands

Quickstart
1. Install
   npm install
2. Configure `.env` (see `.env.example`)
3. Deploy commands (optional):
   node src/deploy-commands.js
4. Start (recommended via manager for production):
   node src/manager.js
   or single worker for dev: node src/worker.js

LICENSE:
MIT
