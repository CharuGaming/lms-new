import mongoose, { Schema, models, model } from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  school?: string;
  address?: string;
  city?: string;
  district?: string;
  createdAt: Date;
  resetPasswordOtp?: string;
  resetPasswordExpires?: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  school: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  district: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  resetPasswordOtp: { type: String },
  resetPasswordExpires: { type: Date },
});

export const User = models.User || model<IUser>('User', UserSchema);
