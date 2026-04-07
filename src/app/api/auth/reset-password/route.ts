import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/db';
import { User } from '@/backend/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify OTP
    if (!user.resetPasswordOtp || !user.resetPasswordExpires) {
      return NextResponse.json({ error: 'No OTP requested for this user' }, { status: 400 });
    }

    if (user.resetPasswordOtp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (new Date() > user.resetPasswordExpires) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Update Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    // Clear OTP fields
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
