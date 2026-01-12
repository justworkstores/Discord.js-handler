export default {
  id: 'sample-modal',
  async execute(interaction) {
    const fieldValue = interaction.fields.getTextInputValue('someInputId') || 'N/A';
    await interaction.reply({ content: `Modal received: ${fieldValue}`, ephemeral: true });
  }
};
