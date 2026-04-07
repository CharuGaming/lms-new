import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { Enrollment } from '@/backend/models/Enrollment';
import { Course } from '@/backend/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { status } = await request.json();

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();
    
    const enrollment = await Enrollment.findById(id);
    if (!enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });

    const oldStatus = enrollment.status;
    enrollment.status = status;
    await enrollment.save();

    // If status changed to approved, increment course enrolledCount
    if (oldStatus !== 'approved' && status === 'approved') {
      await Course.findByIdAndUpdate(enrollment.courseId, { $inc: { enrolledCount: 1 } });
    } 
    // If status changed from approved to something else, decrement
    else if (oldStatus === 'approved' && status !== 'approved') {
      await Course.findByIdAndUpdate(enrollment.courseId, { $inc: { enrolledCount: -1 } });
    }

    return NextResponse.json(enrollment);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 });
  }
}
