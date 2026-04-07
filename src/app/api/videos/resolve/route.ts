import { NextResponse } from 'next/server';
import { requireAuth } from '@/backend/middleware/auth.middleware';
import { decryptVideoToken } from '@/backend/services/crypto.service';

/**
 * POST /api/videos/resolve
 * Body: { token: "encrypted_token_string" }
 * 
 * Decrypts the token and returns the YouTube video ID.
 * This endpoint is called by the VideoPlayer at runtime.
 * The token is short-lived (5 min) so it can't be reused easily.
 */
export const POST = requireAuth(async (request: Request, context: any, user: { id: string, role: string }) => {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const payload = decryptVideoToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
    }

    return NextResponse.json({ videoId: payload.videoId });
  } catch (error: any) {
    console.error('Video resolve error:', error);
    return NextResponse.json({ error: 'Failed to resolve video' }, { status: 500 });
  }
});
