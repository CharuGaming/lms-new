import mongoose from 'mongoose';
import { User } from './src/backend/models/User';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

async function check() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('No MONGODB_URI found');
    return;
  }

  await mongoose.connect(uri);
  const user = await User.findOne({ email: 'admin@educator.com' });
  
  if (user) {
    console.log('User found:', user.email);
    const isValid = await bcrypt.compare('admin123', user.password);
    console.log('Password "admin123" is valid:', isValid);
    
    if (!isValid) {
        console.log('Updating password to "admin123"...');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        user.password = hashedPassword;
        await user.save();
        console.log('Password updated.');
    }
  } else {
    console.log('User not found.');
  }

  await mongoose.disconnect();
}

check().catch(console.error);
