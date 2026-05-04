import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { connectDB } from '@/backend/lib/db';
import { Resource } from '@/backend/models/Resource';

// DELETE /api/resources/[id] — soft-delete a resource (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const resource = await Resource.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resource DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}
