import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { LiveClass } from '@/backend/models/LiveClass';
import { requireAdminOrTeacher } from '@/backend/middleware/auth.middleware';

export const DELETE = requireAdminOrTeacher(async (request: Request, { params }: { params: { id: string } }) => {
  try {
    await connectDB();
    const result = await LiveClass.findByIdAndDelete(params.id);
    if (!result) return NextResponse.json({ error: 'Live class not found' }, { status: 404 });
    return NextResponse.json({ message: 'Live class deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete live class' }, { status: 500 });
  }
});
