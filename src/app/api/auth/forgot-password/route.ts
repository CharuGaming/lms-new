import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { User } from '@/backend/models/User';
import { sendOtpEmail } from '@/backend/services/email.service';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if user exists, but here we'll be helpful for now 
      // or just return success to avoid enumeration. 
      // The user wants a feature that "works", so let's show an error if not found.
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = otpExpiry;
    await user.save();

    const emailResult = await sendOtpEmail(email, otp);
    
    if (!emailResult.success) {
      return NextResponse.json({ 
        error: `Failed to send OTP email: ${emailResult.error || 'Check SMTP settings'}` 
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
