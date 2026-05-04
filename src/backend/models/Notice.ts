import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Notice message is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);
