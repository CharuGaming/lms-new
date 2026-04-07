import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/backend/lib/auth';
import { uploadFileToDrive } from '@/backend/services/drive.service';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    
    // Only teachers and admins can upload files
    if (!session || (role !== 'admin' && role !== 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = await uploadFileToDrive(file.name, file.type, buffer);

    if (!fileId) {
      throw new Error('Failed to upload file');
    }

    return NextResponse.json({ fileId, fileName: file.name, mimeType: file.type });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
