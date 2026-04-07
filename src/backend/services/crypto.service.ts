/**
 * Crypto Service for Video Token Protection
 * Encrypts/decrypts YouTube video IDs into short-lived, signed tokens
 * so the raw video ID is never exposed to the browser.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function getKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-key-change-me';
  // Derive a 32-byte key from the secret
  return crypto.createHash('sha256').update(secret).digest();
}

interface TokenPayload {
  videoId: string;
  courseId: string;
  lessonIndex: string;
  exp: number;
}

/**
 * Encrypts a video ID into a secure, time-limited token.
 */
export function encryptVideoToken(videoId: string, courseId: string, lessonIndex: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(16);

  const payload: TokenPayload = {
    videoId,
    courseId,
    lessonIndex,
    exp: Date.now() + TOKEN_EXPIRY_MS,
  };

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  // Combine iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a video token and returns the video ID if valid and not expired.
 */
export function decryptVideoToken(token: string): TokenPayload | null {
  try {
    const key = getKey();
    const parts = token.split(':');
    if (parts.length !== 3) return null;

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const payload: TokenPayload = JSON.parse(decrypted);

    // Check expiration
    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Token decryption failed:', error);
    return null;
  }
}
