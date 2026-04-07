import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { Course } from '@/backend/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';

// GET single course
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const course = await Course.findById(id);
    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(course);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

// PUT update course (admin only)
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await context.params;
    const body = await request.json();
    const course = await Course.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(course);
  } catch {
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

// DELETE course (admin only)
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await context.params;
    await Course.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
