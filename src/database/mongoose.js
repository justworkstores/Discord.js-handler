import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export default async function connectDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    logger.warn('MONGO_URI not set. Skipping DB connection.');
    return;
  }
  mongoose.set('strictQuery', false);
  try {
    await mongoose.connect(uri, { keepAlive: true, connectTimeoutMS: 10000 });
    logger.info('Connected to MongoDB.');
  } catch (err) {
    logger.error({ err }, 'Failed to connect to MongoDB');
  }
}

export async function disconnect() {
  return mongoose.disconnect();
}
