import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { Course } from '@/backend/models/Course';
import { Enrollment } from '@/backend/models/Enrollment';
import { requireAuth } from '@/backend/middleware/auth.middleware';
import { encryptVideoToken } from '@/backend/services/crypto.service';

/**
 * GET /api/videos/token?courseId=xxx&moduleIndex=0&lessonIndex=1
 * 
 * Returns an encrypted, short-lived token containing the YouTube video ID.
 * The student must be enrolled and approved to get a token.
 * The token hides the video ID from browser inspection.
 */
export const GET = requireAuth(async (request: Request, context: any, user: { id: string, role: string }) => {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const moduleIndex = parseInt(searchParams.get('moduleIndex') || '0', 10);
    const lessonIndex = parseInt(searchParams.get('lessonIndex') || '0', 10);

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    await connectDB();

    // Verify enrollment for students
    if (user.role !== 'admin' && user.role !== 'teacher') {
      const enrollment = await Enrollment.findOne({
        userId: user.id,
        courseId,
        status: 'approved',
      });
      if (!enrollment) {
        return NextResponse.json({ error: 'You must be enrolled to access this content' }, { status: 403 });
      }
    }

    // Fetch the course and extract the video ID
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const module = course.modules?.[moduleIndex];
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const lesson = module.lessons?.[lessonIndex];
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const videoId = lesson.videoId || lesson.videoUrl;
    if (!videoId) {
      return NextResponse.json({ error: 'This lesson has no video' }, { status: 404 });
    }

    // Generate encrypted token (expires in 5 minutes)
    const token = encryptVideoToken(videoId, courseId, `${moduleIndex}-${lessonIndex}`);

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('Video token error:', error);
    return NextResponse.json({ error: 'Failed to generate video token' }, { status: 500 });
  }
});
