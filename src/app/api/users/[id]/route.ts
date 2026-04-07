import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { User } from '@/backend/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await context.params;
    const body = await request.json();

    const allowedRoles = ['admin', 'teacher', 'student'];
    if (body.role && !allowedRoles.includes(body.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(id, { role: body.role }, { new: true }).select('-password');
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
