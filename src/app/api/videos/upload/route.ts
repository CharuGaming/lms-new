import { NextResponse } from 'next/server';
import { requireAdminOrTeacher } from '@/backend/middleware/auth.middleware';
import { uploadVideoToYouTube } from '@/backend/services/youtube-upload.service';

const MAX_SIZE = 500 * 1024 * 1024; // 500MB

export const POST = requireAdminOrTeacher(async (request: Request, context: any, user: { id: string, role: string }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File;
    const title = (formData.get('title') as string) || 'LMS Lesson Video';
    const description = (formData.get('description') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: MP4, WebM, MOV, AVI, MKV` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadVideoToYouTube(buffer, title, description);

    return NextResponse.json({
      videoId: result.videoId,
      title: result.title,
      status: result.status,
    });
  } catch (error: any) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload video' },
      { status: 500 }
    );
  }
});
