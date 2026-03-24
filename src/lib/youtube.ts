// YouTube Video Utilities for CareerCanvas LMS

/**
 * Convert YouTube URL to embed URL for better performance
 * @param url - YouTube URL (watch or embed)
 * @returns Optimized embed URL
 */
export function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';

  // Extract video ID from various YouTube URL formats
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return url;

  // Return optimized embed URL with performance parameters
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
}

/**
 * Extract video ID from YouTube URL
 * @param url - YouTube URL
 * @returns Video ID or null
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Get YouTube thumbnail URL
 * @param videoId - YouTube video ID
 * @param quality - Thumbnail quality (default, medium, high, maxres)
 * @returns Thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality === 'maxres' ? 'maxresdefault' : quality === 'high' ? 'hqdefault' : quality === 'medium' ? 'mqdefault' : 'default'}.jpg`;
}

/**
 * Create optimized video player props
 * @param url - YouTube URL
 * @returns Player configuration
 */
export function createVideoPlayerProps(url: string) {
  const videoId = extractYouTubeVideoId(url);
  
  return {
    src: getYouTubeEmbedUrl(url),
    thumbnail: videoId ? getYouTubeThumbnail(videoId) : undefined,
    loading: 'lazy' as const,
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    allowFullScreen: true,
  };
}

/**
 * Validate YouTube URL
 * @param url - URL to validate
 * @returns Boolean indicating if URL is valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}