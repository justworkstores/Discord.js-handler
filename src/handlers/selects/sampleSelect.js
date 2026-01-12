export default {
  id: 'sample-select',
  async execute(interaction) { await interaction.reply({ content: `Selected: ${interaction.values.join(', ')}`, ephemeral: true }); }
};
