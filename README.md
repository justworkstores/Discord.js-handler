# Multipurpose Discord Bot (JS, ESM) — Handler Scaffold

This scaffold provides:
- ESM (import/export) JavaScript
- Slash commands with subcommands
- Auto-registration (deploy script) for slash commands
- Cooldowns and alias support (deploy script will create alias commands if provided)
- Handlers for buttons, select menus, modals
- Mongoose (MongoDB) integration
- Example command/event/handlers

Quickstart
1. Copy files into your repo.
2. Create a `.env` based on `.env.example`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Deploy commands:
   - For development (guild): set GUILD_ID in .env then:
     ```bash
     npm run deploy-commands
     ```
   - For global:
     ```bash
     unset GUILD_ID
     npm run deploy-commands
     ```
5. Start the bot:
   ```bash
   npm start
   ```

Notes
- Slash command changes: run `npm run deploy-commands`.
- Aliases: slash commands can't be dynamically aliased; the scaffold optionally registers alias names as separate slash commands if you add `aliases` in command files.
- Keep `CLIENT_ID` set to your application's client ID.
- Use Node 18+.
