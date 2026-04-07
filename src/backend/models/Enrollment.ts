import mongoose, { Schema, models, model } from 'mongoose';

export interface IEnrollment {
  _id: string;
  userId: string | any;
  courseId: string;
  completedLessons: string[];
  enrolledAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
  paymentMethod: string;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  userId: { type: String, ref: 'User', required: true },
  courseId: { type: String, required: true },
  completedLessons: [{ type: String }],
  enrolledAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  receiptUrl: { type: String },
  paymentMethod: { type: String, default: 'bank_transfer' },
});

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Enrollment = models.Enrollment || model<IEnrollment>('Enrollment', EnrollmentSchema);

