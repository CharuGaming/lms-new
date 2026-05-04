import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { Notice } from '@/backend/models/Notice';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Admins see all notices, others see only active ones
    const isAdmin = (session.user as any).role === 'admin';
    const query = isAdmin ? {} : { isActive: true };
    
    const notices = await Notice.find(query).sort({ createdAt: -1 });
    return NextResponse.json(notices);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { title, message, isActive } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notice = await Notice.create({
      title,
      message,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json({ success: true, notice }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 });
  }
}
