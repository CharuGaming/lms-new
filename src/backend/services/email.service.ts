import nodemailer from 'nodemailer';
import { Settings } from '@/backend/models/Settings';
import { connectDB } from '@/backend/lib/db';

export async function getTransporter() {
  await connectDB();
  const settings = await Settings.findOne();
  
  const user = settings?.smtpUser || process.env.SMTP_USER;
  const pass = settings?.smtpPass || process.env.SMTP_PASS;

  if (!user || !pass) {
    console.error('SMTP configuration is missing. Cannot send emails.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
}

export async function verifySmtp(user: string, pass: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    await transporter.verify();
    return { success: true };
  } catch (error: any) {
    console.error('SMTP Verification Error:', error);
    return { success: false, error: error.message || 'Connection failed' };
  }
}

export async function sendOtpEmail(to: string, otp: string) {
  await connectDB();
  const settings = await Settings.findOne();
  const transporter = await getTransporter();

  if (!transporter) {
    return { success: false, error: 'SMTP configuration is missing in settings' };
  }

  const fromEmail = settings?.smtpUser || process.env.SMTP_USER;

  const mailOptions = {
    from: `"LMS Support" <${fromEmail}>`,
    to,
    subject: 'Your Password Reset OTP',
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #6366f1;">Password Reset Request</h2>
        <p>You requested to reset your password. Use the following 6-digit OTP to proceed:</p>
        <div style="background: #f4f4f9; padding: 15px; border-radius: 10px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0; color: #1a1a1a;">
          ${otp}
        </div>
        <p>This OTP is valid for 15 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">This is an automated message from your LMS Platform.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message || 'Error occurred during delivery' };
  }
}

export async function sendVerificationEmail(to: string, otp: string) {
  await connectDB();
  const settings = await Settings.findOne();
  const transporter = await getTransporter();

  if (!transporter) {
    return { success: false, error: 'SMTP configuration is missing. Admin must configure email settings.' };
  }

  const fromEmail = settings?.smtpUser || process.env.SMTP_USER;
  const platformName = settings?.platformName || 'LMS Platform';

  const mailOptions = {
    from: `"${platformName}" <${fromEmail}>`,
    to,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #f5a623;">Email Verification</h2>
        <p>Thank you for registering! Please use the following 6-digit code to verify your email address:</p>
        <div style="background: #f4f4f9; padding: 15px; border-radius: 10px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 8px; margin: 20px 0; color: #1a1a1a;">
          ${otp}
        </div>
        <p>This code is valid for <strong>10 minutes</strong>. If you did not create an account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">This is an automated message from ${platformName}.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message || 'Error occurred during delivery' };
  }
}
