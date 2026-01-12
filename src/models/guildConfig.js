import mongoose from 'mongoose';

const GuildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  prefix: { type: String, default: '!' },
  language: { type: String, default: 'en' },
  createdAt: { type: Date, default: () => new Date() }
});

export default mongoose.models.GuildConfig || mongoose.model('GuildConfig', GuildConfigSchema);
