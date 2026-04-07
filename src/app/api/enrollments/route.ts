import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { Enrollment } from '@/backend/models/Enrollment';
import { Course } from '@/backend/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import fs from 'fs';
import path from 'path';

// GET user enrollments
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const userContext = session.user as any;

    if (userContext.role === 'admin') {
      // Load User model so populate works
      await import('@/backend/models/User');
      const enrollments = await Enrollment.find().populate('userId', 'name email').sort({ status: -1, enrolledAt: -1 });
      return NextResponse.json(enrollments);
    } else {
      const enrollments = await Enrollment.find({ userId: userContext.id });
      return NextResponse.json(enrollments);
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}

// POST enroll in course
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const formData = await request.formData();
    const courseId = formData.get('courseId') as string;
    const receiptFile = formData.get('receipt') as File | null;
    const paymentMethod = formData.get('paymentMethod') as string || 'bank_transfer';
    const userId = (session.user as any).id;

    if (!courseId) return NextResponse.json({ error: 'courseId is required' }, { status: 400 });

    // Check if already enrolled
    const existing = await Enrollment.findOne({ userId, courseId });
    if (existing) return NextResponse.json({ error: 'Already enrolled' }, { status: 409 });

    let receiptUrl = '';
    if (receiptFile && receiptFile.size > 0) {
      const bytes = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileName = `${userId}-${Date.now()}-${receiptFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
      receiptUrl = `/uploads/receipts/${fileName}`;
    }

    let status = 'pending';
    
    if (paymentMethod === 'gateway_mock') {
      // Automatic approval logic for our simulated Stripe/Local Gateway
      status = 'approved';
    } else if (receiptUrl) {
      status = 'pending';
    } else {
      status = 'approved'; // Assumed free course if no receipt and no gateway mock
    }

    const enrollment = await Enrollment.create({ 
      userId, 
      courseId,
      receiptUrl,
      paymentMethod,
      status
    });

    if (status === 'approved') {
      await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
    }

    return NextResponse.json(enrollment, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 });
  }
}
