import mongoose from 'mongoose';

const resourceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
  },
  color: {
    type: String,
    default: 'var(--primary)', // Default color if needed
  },
}, {
  timestamps: true,
});

export const ResourceCategory = mongoose.models.ResourceCategory || mongoose.model('ResourceCategory', resourceCategorySchema);
