import { InteractionType } from 'discord.js';
import logger from '../utils/logger.js';
import { client } from '../handlers/_sharedClient.js';
import { initCooldownStore } from '../storage/cooldownStore.js';

let cooldownStorePromise = initCooldownStore();

export default {
  name: 'interactionCreate',
  async execute(_, interaction) {
    try {
      const cooldownStore = await cooldownStorePromise;
      if (interaction.isChatInputCommand()) {
        const cmdName = interaction.commandName;
        const command = client.commands.get(cmdName) || client.commands.get(client.commandAliases.get(cmdName));
        if (!command) return interaction.reply({ content: 'Unknown command.', ephemeral: true });

        const cd = Number(command.cooldown) || 0;
        if (cd > 0) {
          const key = `cd:${cmdName}:${interaction.user.id}`;
          if (await cooldownStore.has(key)) {
            return interaction.reply({ content: `You're on cooldown for this command.`, ephemeral: true });
          }
          await cooldownStore.set(key, cd);
        }

        await command.execute(interaction);
        return;
      }

      if (interaction.isButton()) {
        const customId = interaction.customId;
        for (const [id, h] of client.buttons) if (customId.startsWith(id)) return h.execute(interaction);
      }

      if (interaction.isStringSelectMenu()) {
        const customId = interaction.customId;
        for (const [id, h] of client.selects) if (customId.startsWith(id)) return h.execute(interaction);
      }

      if (interaction.type === InteractionType.ModalSubmit) {
        const customId = interaction.customId;
        for (const [id, h] of client.modals) if (customId.startsWith(id)) return h.execute(interaction);
      }
    } catch (err) {
      logger.error({ err }, 'Error handling interaction');
      try {
        if (interaction.replied || interaction.deferred) await interaction.followUp({ content: 'There was an error while executing this interaction.', ephemeral: true });
        else await interaction.reply({ content: 'There was an error while executing this interaction.', ephemeral: true });
      } catch (e) {
        logger.error({ e }, 'Failed to send error reply');
      }
    }
  }
};
