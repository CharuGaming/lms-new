import mongoose, { Schema, models, model } from 'mongoose';

export interface IComment {
  _id: string;
  userId: string;
  userName: string;
  lessonId: string;
  courseId: string;
  content: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  lessonId: { type: String, required: true },
  courseId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Comment = models.Comment || model<IComment>('Comment', CommentSchema);
