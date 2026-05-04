import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { Enrollment } from '@/backend/models/Enrollment';
import { Course } from '@/backend/models/Course';
import { getFileFromDrive } from '@/backend/services/drive.service';
import { requireAuth } from '@/backend/middleware/auth.middleware';
import { Readable } from 'stream';

export const GET = requireAuth(async (request: Request, context: any, user: { id: string, role: string }) => {
  try {
    const params = await context.params;
    const fileId = params?.fileId;

    if (!fileId) {
      return NextResponse.json({ error: 'Missing file ID' }, { status: 400 });
    }

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
       return NextResponse.json({ error: 'File not found on server or Google Drive' }, { status: 404 });
    }

    const { stream, mimeType, fileName } = driveFile;

    try {
      // Use native Node.js conversion (Node 17+)
      // Cast as any to avoid strict TS conflicts between Node/Web streams in Next.js
      const webStream = Readable.toWeb(stream as Readable);

      return new Response(webStream as any, {
          headers: {
              'Content-Type': mimeType || 'application/pdf',
              'Content-Disposition': `attachment; filename="${fileName}"`,
              'Cache-Control': 'private, max-age=3600',
          }
      });
    } catch (streamError) {
      console.error('Conversion or response error:', streamError);
      return NextResponse.json({ error: 'Failed to process file stream' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('File stream API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during file streaming',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
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
