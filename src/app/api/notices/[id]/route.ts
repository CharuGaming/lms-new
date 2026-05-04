import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { Notice } from '@/backend/models/Notice';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await context.params;
    const body = await request.json();

    const notice = await Notice.findByIdAndUpdate(id, body, { new: true });
    if (!notice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    return NextResponse.json({ success: true, notice });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update notice' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await context.params;

    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    return NextResponse.json({ success: true, message: 'Notice deleted successfully' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 });
  }
}
