export default {
  id: 'sample-button',
  async execute(interaction) { await interaction.reply({ content: `Button clicked by ${interaction.user.tag}`, ephemeral: true }); }
};
