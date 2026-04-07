import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { User } from '@/backend/models/User';
import { sendVerificationEmail } from '@/backend/services/email.service';

// In-memory store for registration OTPs (keyed by email)
// In production, use Redis or a DB collection with TTL
const pendingVerifications = new Map<string, { otp: string; expires: Date }>();

export { pendingVerifications };

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'This email is already registered. Please sign in instead.' }, { status: 409 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in memory
    pendingVerifications.set(email, { otp, expires });

    // Send verification email
    const result = await sendVerificationEmail(email, otp);

    if (!result.success) {
      pendingVerifications.delete(email);
      return NextResponse.json(
        { error: `Failed to send verification email: ${result.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Verification code sent to your email' });
  } catch (error: any) {
    console.error('Registration OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
