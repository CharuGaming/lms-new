/**
 * YouTube Data API v3 - Video Upload Service
 * Uploads videos to YouTube as UNLISTED using OAuth2 credentials.
 * 
 * Required env vars:
 *   YOUTUBE_CLIENT_ID
 *   YOUTUBE_CLIENT_SECRET
 *   YOUTUBE_REFRESH_TOKEN
 */

import { google } from 'googleapis';
import { Readable } from 'stream';

import { connectDB } from '@/backend/lib/db';
import { Settings } from '@/backend/models/Settings';

const getYouTubeClient = async () => {
  let clientId = process.env.YOUTUBE_CLIENT_ID;
  let clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  let refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  // Try to get from database first
  try {
    await connectDB();
    const settings = await Settings.findOne();
    if (settings) {
      if (settings.youtubeClientId) clientId = settings.youtubeClientId;
      if (settings.youtubeClientSecret) clientSecret = settings.youtubeClientSecret;
      if (settings.youtubeRefreshToken) refreshToken = settings.youtubeRefreshToken;
    }
  } catch (dbError) {
    console.warn('Could not fetch YouTube config from database, falling back to process.env');
  }

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('YouTube OAuth2 credentials not configured. Upload will be simulated.');
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.youtube({ version: 'v3', auth: oauth2Client });
};

export interface YouTubeUploadResult {
  videoId: string;
  title: string;
  status: string;
}

/**
 * Uploads a video buffer to YouTube as UNLISTED.
 */
export async function uploadVideoToYouTube(
  buffer: Buffer,
  title: string,
  description: string = ''
): Promise<YouTubeUploadResult> {
  const youtube = await getYouTubeClient();

  if (!youtube) {
    // Simulate upload for development/testing
    console.warn('YouTube client not configured. Returning simulated upload result.');
    const fakeId = `sim_${Date.now().toString(36)}`;
    return {
      videoId: fakeId,
      title,
      status: 'simulated',
    };
  }

  try {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description: description || `Uploaded via LMS Platform`,
          categoryId: '27', // Education
        },
        status: {
          privacyStatus: 'unlisted', // Not searchable, only accessible via direct link
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: stream,
      },
    });

    const videoId = response.data.id;
    if (!videoId) {
      throw new Error('YouTube upload succeeded but returned no video ID');
    }

    return {
      videoId,
      title: response.data.snippet?.title || title,
      status: response.data.status?.uploadStatus || 'uploaded',
    };
  } catch (error: any) {
    console.error('YouTube upload error:', error?.message || error);
    throw new Error(`Failed to upload video to YouTube: ${error?.message || 'Unknown error'}`);
  }
}
