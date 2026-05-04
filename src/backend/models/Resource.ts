import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  fileName: {
    type: String,
    required: true,
  },
  fileId: {
    type: String,
    required: [true, 'File ID is required'],
  },
  mimeType: {
    type: String,
    default: 'application/pdf',
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    default: 'Other',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
