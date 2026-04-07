import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { Enrollment } from '@/backend/models/Enrollment';
import { Course } from '@/backend/models/Course';
import { getFileFromDrive } from '@/backend/services/drive.service';
import { requireAuth } from '@/backend/middleware/auth.middleware';

export const GET = requireAuth(async (request: Request, context: any, user: { id: string, role: string }) => {
  try {
    const { fileId } = await context.params;
    const { id: userId, role } = user;

    await connectDB();

    // Security check: Verify enrollment or admin/teacher role
    if (role !== 'admin' && role !== 'teacher') {
      const isEnrolled = await isUserEnrolledInCourseWithFile(userId, fileId);
      if (!isEnrolled) {
        return NextResponse.json({ error: 'Forbidden: You must be enrolled in the course to access this file.' }, { status: 403 });
      }
    }

    // Fetch file (works for both local files and Google Drive files)
    const driveFile = await getFileFromDrive(fileId);
    
    if (!driveFile) {
       return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const { stream, mimeType, fileName } = driveFile;

    // Convert NodeJS readable stream to Web ReadableStream
    const webReadableStream = new ReadableStream({
        start(controller) {
          stream.on('data', (chunk) => controller.enqueue(chunk));
          stream.on('end', () => controller.close());
          stream.on('error', (err) => controller.error(err));
        }
    });

    return new Response(webReadableStream, {
        headers: {
            'Content-Type': mimeType,
            'Content-Disposition': `inline; filename="${fileName}"`,
            'Cache-Control': 'private, max-age=3600',
        }
    });

  } catch (error) {
    console.error('File stream error:', error);
    return NextResponse.json({ error: 'Failed to stream file' }, { status: 500 });
  }
});

// Helper function to check enrollment containing the fileId
async function isUserEnrolledInCourseWithFile(userId: string, targetFileId: string): Promise<boolean> {
  const enrollments = await Enrollment.find({ userId, status: 'approved' }).select('courseId');
  if (!enrollments || enrollments.length === 0) return false;

  const courseIds = enrollments.map(e => e.courseId);

  const course = await Course.findOne({
    _id: { $in: courseIds },
    'modules.lessons.fileId': targetFileId
  }).select('_id');

  return !!course;
}
