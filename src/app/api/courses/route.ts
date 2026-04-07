import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { Course } from '@/backend/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { requireAdminOrTeacher } from '@/backend/middleware/auth.middleware';

// GET all courses (public)
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let filter: any = {};
    if (category && category !== 'All') filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const courses = await Course.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(courses);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST create course (admin and teacher only)
export const POST = requireAdminOrTeacher(async (request: Request, context: any, user: { id: string, role: string }) => {
  try {
    await connectDB();
    const body = await request.json();
    const course = await Course.create({
      ...body,
      instructorId: user.id,
    });
    return NextResponse.json(course, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
});
