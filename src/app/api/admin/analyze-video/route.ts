import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { requireAdminOrTeacher } from '@/backend/middleware/auth.middleware';
import { analyzeVideoMetadata } from '@/backend/services/ai.service';
import fs from 'fs';
import os from 'os';
import path from 'path';

// POST /api/admin/analyze-video
export const POST = requireAdminOrTeacher(async (request: Request) => {
  try {
    await connectDB();
    const formData = await request.formData();
    const videoFile = formData.get('file') as File;

    if (!videoFile) {
        return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Save File to temp location
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `${Date.now()}-${videoFile.name}`);
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.promises.writeFile(tempFilePath, buffer);

    try {
        // Run AI Analysis
        const metadata = await analyzeVideoMetadata(tempFilePath);
        
        // Cleanup
        await fs.promises.unlink(tempFilePath);

        return NextResponse.json(metadata);
    } catch (aiError: any) {
        // Ensure cleanup on failure
        if (fs.existsSync(tempFilePath)) await fs.promises.unlink(tempFilePath);
        throw aiError;
    }

  } catch (error: any) {
    console.error('Video analysis API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze video' }, { status: 500 });
  }
});
