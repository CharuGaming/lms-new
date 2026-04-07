import { google } from 'googleapis';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { connectDB } from '@/backend/lib/db';
import { Settings } from '@/backend/models/Settings';

// Local storage directory for when Drive isn't available
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Initialize the Google Drive API client
const getDriveClient = async () => {
  try {
    let credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;

    // Try to get from database first
    try {
      await connectDB();
      const settings = await Settings.findOne();
      if (settings?.googleCredentialsJson) {
        credentialsJson = settings.googleCredentialsJson;
      }
    } catch (dbError) {
      console.warn('Could not fetch Drive config from database, falling back to process.env');
    }

    if (!credentialsJson) return null;
    const credentials = JSON.parse(credentialsJson || '{}');
    if (!credentials.project_id) return null;

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'],
    });
    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Failed to initialize Google Drive client:', error);
    return null;
  }
};

/**
 * Uploads a file buffer to Google Drive.
 * Falls back to local filesystem storage if Drive isn't available.
 */
export async function uploadFileToDrive(fileName: string, mimeType: string, buffer: Buffer): Promise<string | null> {
  const drive = await getDriveClient();

  // Try Google Drive upload first
  if (drive) {
    try {
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          mimeType,
        },
        media: {
          mimeType,
          body: stream,
        },
        fields: 'id',
      });

      const fileId = response.data.id;
      if (fileId) {
        console.log(`✅ File uploaded to Google Drive: ${fileId}`);
        return fileId;
      }
    } catch (error: any) {
      console.warn('Google Drive upload failed, falling back to local storage.');
      console.warn('Drive error:', error?.message || error);
    }
  }

  // Fallback: Save to local filesystem
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueId = `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const storedFileName = `${uniqueId}__${safeFileName}`;
    const filePath = path.join(UPLOADS_DIR, storedFileName);

    fs.writeFileSync(filePath, buffer);
    console.log(`📁 File saved locally: ${storedFileName}`);

    return storedFileName;
  } catch (err) {
    console.error('Local file save error:', err);
    return null;
  }
}

/**
 * Streams a file — first checks local storage, then tries Google Drive.
 */
export async function getFileFromDrive(fileId: string): Promise<{ stream: NodeJS.ReadableStream; mimeType: string; fileName: string } | null> {
  // Check if it's a local file
  if (fileId.startsWith('local_')) {
    const filePath = path.join(UPLOADS_DIR, fileId);

    if (fs.existsSync(filePath)) {
      const ext = path.extname(fileId).toLowerCase();
      const mimeMap: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.txt': 'text/plain',
      };

      // Extract the original filename from the stored name (after the __) 
      const originalName = fileId.includes('__') ? fileId.split('__').slice(1).join('__') : fileId;

      return {
        stream: fs.createReadStream(filePath),
        mimeType: mimeMap[ext] || 'application/octet-stream',
        fileName: originalName,
      };
    }

    console.warn(`Local file not found: ${filePath}`);
    return null;
  }

  // Try Google Drive
  const drive = await getDriveClient();
  if (!drive) {
    console.warn('Google Drive is not configured and file is not local.');
    return null;
  }

  try {
    const fileMeta = await drive.files.get({ fileId, fields: 'mimeType,name' });
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return {
      stream: response.data,
      mimeType: fileMeta.data.mimeType || 'application/octet-stream',
      fileName: fileMeta.data.name || 'download',
    };
  } catch (error) {
    console.error('Error fetching file from Drive:', error);
    return null;
  }
}

/**
 * Deletes a file from Google Drive or local storage.
 */
export async function deleteFileFromDrive(fileId: string): Promise<boolean> {
  // Local file deletion
  if (fileId.startsWith('local_')) {
    const filePath = path.join(UPLOADS_DIR, fileId);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch (err) {
      console.error('Local file delete error:', err);
      return false;
    }
  }

  // Google Drive deletion
  const drive = await getDriveClient();
  if (!drive) return true;

  try {
    await drive.files.delete({ fileId });
    return true;
  } catch (error) {
    console.error('Error deleting file from Drive:', error);
    return false;
  }
}
