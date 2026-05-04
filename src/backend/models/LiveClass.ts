import mongoose from 'mongoose';

const liveClassSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Class title is required'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Link URL is required'],
  },
  platform: {
    type: String,
    enum: ['zoom', 'meet', 'other'],
    default: 'zoom',
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const LiveClass = mongoose.models.LiveClass || mongoose.model('LiveClass', liveClassSchema);
