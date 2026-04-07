import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { Enrollment } from '@/backend/models/Enrollment';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';

// POST mark lesson complete
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { courseId, lessonId } = await request.json();
    const userId = (session.user as any).id;

    const enrollment = await Enrollment.findOneAndUpdate(
      { userId, courseId },
      { $addToSet: { completedLessons: lessonId } },
      { new: true }
    );

    if (!enrollment) return NextResponse.json({ error: 'Not enrolled' }, { status: 404 });
    return NextResponse.json(enrollment);
  } catch {
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
