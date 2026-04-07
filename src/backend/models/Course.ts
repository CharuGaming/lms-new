import mongoose, { Schema, models, model } from 'mongoose';

const LessonSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'file', 'text'], default: 'video' },
  videoId: { type: String, default: '' },
  fileId: { type: String, default: '' },
  content: { type: String, default: '' },
  duration: { type: String, default: '' },
  // Keeping these for legacy compatibility
  videoUrl: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
});

const ModuleSchema = new Schema({
  title: { type: String, required: true },
  lessons: [LessonSchema],
});

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  instructorId?: string;
  isPublished: boolean;
  category: string;
  price: number;
  modules: { title: string; lessons: { title: string; type: string; videoId?: string; fileId?: string; content?: string; duration?: string; videoUrl?: string; pdfUrl?: string; }[] }[];
  enrolledCount: number;
  createdAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, default: '/images/gallery-1.png' },
  instructor: { type: String, default: 'The Educator' },
  instructorId: { type: Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: false },
  category: { type: String, default: 'General' },
  price: { type: Number, default: 0 },
  modules: [ModuleSchema],
  enrolledCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Course = models.Course || model<ICourse>('Course', CourseSchema);
