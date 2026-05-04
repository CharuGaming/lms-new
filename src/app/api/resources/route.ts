import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { connectDB } from '@/backend/lib/db';
import { Resource } from '@/backend/models/Resource';
import { uploadFileToDrive } from '@/backend/services/drive.service';

// GET /api/resources — fetch all active resources (authenticated users)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const resources = await Resource.find({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Resources GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

// POST /api/resources — upload a new resource (admin/teacher only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || (role !== 'admin' && role !== 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    if (!file || !title) {
      return NextResponse.json({ error: 'File and title are required' }, { status: 400 });
    }

    // Upload to Google Drive
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = await uploadFileToDrive(file.name, file.type, buffer);

    if (!fileId) {
      throw new Error('Failed to upload file to storage');
    }

    const resource = await Resource.create({
      title,
      description: description || '',
      fileName: file.name,
      fileId,
      mimeType: file.type,
      category: category || 'Other',
      uploadedBy: (session.user as any).id,
      isActive: true,
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error: any) {
    console.error('Resource POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create resource' }, { status: 500 });
  }
}
