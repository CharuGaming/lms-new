import mongoose from 'mongoose';
import { connectDB } from './src/backend/lib/db';
import { Notice } from './src/backend/models/Notice';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function check() {
  await connectDB();
  const notices = await Notice.find({});
  console.log('Total notices:', notices.length);
  console.log('Notices:', JSON.stringify(notices, null, 2));
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
