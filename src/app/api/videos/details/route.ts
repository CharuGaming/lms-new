import { NextResponse } from 'next/server';
import { requireAdminOrTeacher } from '@/backend/middleware/auth.middleware';
import { getVideoDetails } from '@/backend/services/youtube.service';

export const POST = requireAdminOrTeacher(async (request: Request, context: any, user: { id: string, role: string }) => {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const details = await getVideoDetails(videoId);

    if (!details) {
      return NextResponse.json({ error: 'Video not found or private' }, { status: 404 });
    }

    return NextResponse.json(details, { status: 200 });
  } catch (error) {
    console.error('API Error fetching video details:', error);
    return NextResponse.json({ error: 'Failed to fetch video details' }, { status: 500 });
  }
});
