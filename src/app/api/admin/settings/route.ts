import { NextResponse } from 'next/server';
import { requireAuth } from '@/backend/middleware/auth.middleware';
import { connectDB } from '@/backend/lib/db';
import { Settings } from '@/backend/models/Settings';

/**
 * GET /api/admin/settings
 * Retrieves the system settings.
 * Mask sensitive values for the UI.
 */
export const GET = requireAuth(async (request: Request, context: any, user: { id: string, role: string }) => {
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if not exists
      settings = await Settings.create({});
    }

    // Mask sensitive fields for security
    const sanitizedSettings = JSON.parse(JSON.stringify(settings));
    if (sanitizedSettings.youtubeClientSecret) sanitizedSettings.youtubeClientSecret = '********';
    if (sanitizedSettings.youtubeRefreshToken) sanitizedSettings.youtubeRefreshToken = '********';
    if (sanitizedSettings.mongodbUri) sanitizedSettings.mongodbUri = '********';
    if (sanitizedSettings.googleCredentialsJson) sanitizedSettings.googleCredentialsJson = '********';
    if (sanitizedSettings.smtpPass) sanitizedSettings.smtpPass = '********';

    return NextResponse.json(sanitizedSettings);
  } catch (error: any) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
});

/**
 * POST /api/admin/settings
 * Updates the system settings.
 */
export const POST = requireAuth(async (request: Request, context: any, user: { id: string, role: string }) => {
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    await connectDB();
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    // Update fields (only if provided and not the masked '********' string)
    const fields = [
      'youtubeClientId', 'youtubeClientSecret', 'youtubeRefreshToken',
      'googleCredentialsJson', 'mongodbUri', 'platformName', 'supportEmail',
      'allowRegistrations', 'smtpUser', 'smtpPass'
    ];

    fields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '********') {
        settings[field] = body[field];
      }
    });

    settings.updatedAt = new Date();
    await settings.save();

    return NextResponse.json({ message: 'Settings saved successfully', settings });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
});
