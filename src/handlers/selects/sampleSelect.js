export default {
  id: 'sample-select',
  async execute(interaction) {
    const values = interaction.values;
    await interaction.reply({ content: `You selected: ${values.join(', ')}`, ephemeral: true });
  }
};
