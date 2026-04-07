/**
 * YouTube Data API v3 integration service.
 * Fetches video metadata to safely auto-populate LMS lessons.
 */

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/videos';

export interface YouTubeVideoDetails {
  videoId: string;
  title: string;
  duration: string; // Formatted MM:SS or HH:MM:SS
  thumbnailUrl: string;
}

/**
 * Helper to convert ISO 8601 duration (e.g. PT1H2M10S) to standard clock format (e.g. 1:02:10).
 */
function parseISO8601Duration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '00:00';

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  const mStr = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
  const sStr = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${mStr}:${sStr}`;
  }
  return `${mStr}:${sStr}`;
}

export async function getVideoDetails(videoId: string): Promise<YouTubeVideoDetails | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('YOUTUBE_API_KEY is missing. Returning fallback dummy data.');
    return {
      videoId,
      title: 'YouTube Video (Mocked - Missing API Key)',
      duration: '10:00',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  try {
    const response = await fetch(`${YOUTUBE_API_URL}?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`);
    
    if (!response.ok) {
      throw new Error(`YouTube API returned ${response.status}`);
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return null; // Video not found
    }

    const item = data.items[0];
    const title = item.snippet.title;
    const isoDuration = item.contentDetails.duration;
    
    // Choose the best thumbnail available
    const thumbnails = item.snippet.thumbnails;
    const thumbnailUrl = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url;

    return {
      videoId,
      title,
      duration: parseISO8601Duration(isoDuration),
      thumbnailUrl,
    };
  } catch (error) {
    console.error(`Error fetching YouTube details for ${videoId}:`, error);
    throw new Error('Failed to fetch video details from YouTube.');
  }
}
