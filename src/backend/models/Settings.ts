import mongoose, { Schema, models, model } from 'mongoose';

export interface ISettings {
  _id: string;
  // YouTube Configuration
  youtubeClientId?: string;
  youtubeClientSecret?: string;
  youtubeRefreshToken?: string;
  
  // Google Drive Configuration
  googleCredentialsJson?: string; // Stringified JSON
  
  // MongoDB Configuration
  mongodbUri?: string;
  
  // Firebase Configuration
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;

  // Global Platform settings
  platformName?: string;
  supportEmail?: string;
  allowRegistrations?: boolean;
  
  // SMTP Configuration (for forgot password emails)
  smtpUser?: string;
  smtpPass?: string;
  
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  youtubeClientId: { type: String, default: '' },
  youtubeClientSecret: { type: String, default: '' },
  youtubeRefreshToken: { type: String, default: '' },
  
  googleCredentialsJson: { type: String, default: '' },
  
  mongodbUri: { type: String, default: '' },
  
  firebaseApiKey: { type: String, default: '' },
  firebaseAuthDomain: { type: String, default: '' },
  firebaseProjectId: { type: String, default: '' },
  firebaseStorageBucket: { type: String, default: '' },
  firebaseMessagingSenderId: { type: String, default: '' },
  firebaseAppId: { type: String, default: '' },

  platformName: { type: String, default: 'Antigravity LMS' },
  supportEmail: { type: String, default: '' },
  allowRegistrations: { type: Boolean, default: true },
  
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, default: '' },
  
  updatedAt: { type: Date, default: Date.now },
});

export const Settings = models.Settings || model<ISettings>('Settings', SettingsSchema);
