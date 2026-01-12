import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Ping command with an example subcommand')
    .addSubcommand(sub => sub.setName('info').setDescription('Get ping info')),
  cooldown: 5,
  aliases: ['p'],
  async execute(interaction) {
    if (interaction.options.getSubcommand(false) === 'info') {
      const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
      const latency = sent.createdTimestamp - interaction.createdTimestamp;
      await interaction.editReply({ content: `Pong! API Latency: ${Math.round(interaction.client.ws.ping)}ms. Roundtrip: ${latency}ms` });
      return;
    }
    await interaction.reply(`Pong! API Latency: ${Math.round(interaction.client.ws.ping)}ms`);
  }
};
