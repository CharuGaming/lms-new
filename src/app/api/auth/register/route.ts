import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/backend/lib/db';
import { User } from '@/backend/models/User';
import { pendingVerifications } from './send-otp/route';

export async function POST(request: Request) {
  try {
    const { name, email, password, otp, phone, school, address, city, district, dateOfBirth } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, Email and Password are required' }, { status: 400 });
    }

    if (!otp) {
      return NextResponse.json({ error: 'Email verification code is required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Verify OTP
    const pending = pendingVerifications.get(email);
    if (!pending) {
      return NextResponse.json({ error: 'No verification code found. Please request a new one.' }, { status: 400 });
    }

    if (new Date() > pending.expires) {
      pendingVerifications.delete(email);
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    if (pending.otp !== otp) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // OTP is valid — clean up and create account
    pendingVerifications.delete(email);

    await connectDB();

    // Check if user exists (double check)
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      phone: phone || '',
      school: school || '',
      address: address || '',
      city: city || '',
      district: district || '',
      dateOfBirth: dateOfBirth || null,
    });

    return NextResponse.json(
      { message: 'Account created successfully', user: { id: user._id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
