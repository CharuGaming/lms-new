import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { User } from '@/backend/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
