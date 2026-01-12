import { InteractionType } from 'discord.js';
import logger from '../utils/logger.js';

export default {
  name: 'interactionCreate',
  async execute(client, interaction) {
    try {
      if (interaction.isCommand()) {
        const cmdName = interaction.commandName;
        const command = client.commands.get(cmdName) || client.commands.get(client.commandAliases.get(cmdName));
        if (!command) {
          await interaction.reply({ content: 'Unknown command.', ephemeral: true });
          return;
        }
        const cooldown = Number(command.cooldown) || 0;
        if (cooldown > 0) {
          const now = Date.now();
          const timestamps = client.cooldowns.get(command.data.name) || new Map();
          const userId = interaction.user.id;
          if (timestamps.has(userId)) {
            const expiration = timestamps.get(userId) + cooldown * 1000;
            if (now < expiration) {
              const remaining = Math.ceil((expiration - now) / 1000);
              await interaction.reply({ content: `Please wait ${remaining}s before reusing this command.`, ephemeral: true });
              return;
            }
          }
          timestamps.set(userId, now);
          client.cooldowns.set(command.data.name, timestamps);
          setTimeout(() => timestamps.delete(userId), cooldown * 1000).unref();
        }

        await command.execute(interaction);
        return;
      }

      if (interaction.isButton()) {
        const customId = interaction.customId;
        for (const [id, h] of client.buttons) {
          if (customId.startsWith(id)) {
            return h.execute(interaction);
          }
        }
      }

      if (interaction.isSelectMenu()) {
        const customId = interaction.customId;
        for (const [id, h] of client.selects) {
          if (customId.startsWith(id)) {
            return h.execute(interaction);
          }
        }
      }

      if (interaction.type === InteractionType.ModalSubmit) {
        const customId = interaction.customId;
        for (const [id, h] of client.modals) {
          if (customId.startsWith(id)) {
            return h.execute(interaction);
          }
        }
      }
    } catch (err) {
      logger.error('interactionCreate handler error:', err);
      if (interaction.replied || interaction.deferred) {
        try { await interaction.followUp({ content: 'There was an error while executing this interaction.', ephemeral: true }); } catch {}
      } else {
        try { await interaction.reply({ content: 'There was an error while executing this interaction.', ephemeral: true }); } catch {}
      }
    }
  }
};
