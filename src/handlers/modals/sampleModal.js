export default {
  id: 'sample-modal',
  async execute(interaction) { const val = interaction.fields.getTextInputValue('someInputId') || 'N/A'; await interaction.reply({ content: `Modal value: ${val}`, ephemeral: true }); }
};
