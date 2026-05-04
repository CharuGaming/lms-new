import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { LiveClass } from '@/backend/models/LiveClass';
import { requireAdminOrTeacher } from '@/backend/middleware/auth.middleware';

export async function GET() {
  try {
    await connectDB();
    // Only fetch classes where isActive is true
    const classes = await LiveClass.find({ isActive: true }).sort({ startTime: 1 });
    return NextResponse.json(classes);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch live classes' }, { status: 500 });
  }
}

export const POST = requireAdminOrTeacher(async (request: Request) => {
  try {
    await connectDB();
    const body = await request.json();
    const liveClass = await LiveClass.create(body);
    return NextResponse.json(liveClass, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create live class' }, { status: 500 });
  }
});
