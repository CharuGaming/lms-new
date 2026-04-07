import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { User } from '@/backend/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';

// GET — fetch own profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findById((session.user as any).id).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PATCH — update own profile
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await request.json();

    // Only allow updating safe fields
    const allowedFields = ['name', 'phone', 'dateOfBirth', 'school', 'address', 'city', 'district', 'avatar'];
    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const user = await User.findByIdAndUpdate(
      (session.user as any).id,
      updates,
      { new: true }
    ).select('-password');

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

// DELETE — delete own account
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    await User.findByIdAndDelete((session.user as any).id);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
