/**
 * Convert various YouTube URL formats to embeddable URL
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID (already embed format)
 */
export function convertToEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return null;

  // Already embed URL
  if (trimmedUrl.includes('youtube.com/embed/')) {
    return trimmedUrl;
  }

  // Extract video ID from various formats
  let videoId: string | null = null;

  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmedUrl.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }

  // youtu.be/VIDEO_ID
  if (!videoId) {
    const shortMatch = trimmedUrl.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }
  }

  // youtube.com/shorts/VIDEO_ID
  if (!videoId) {
    const shortsMatch = trimmedUrl.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) {
      videoId = shortsMatch[1];
    }
  }

  // Return embed URL or original if no match
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return trimmedUrl;
}
