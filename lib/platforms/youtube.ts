import type { VideoMetadata } from '@/types';

function extractVideoId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function parseIsoDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const [, h, min, s] = m;
  return (Number(h) || 0) * 3600 + (Number(min) || 0) * 60 + (Number(s) || 0);
}

/**
 * Fetches YouTube video metadata.
 * - With YOUTUBE_API_KEY set: full stats via the Data API v3 (videos.list).
 * - Without it: falls back to the public oEmbed endpoint, which returns
 *   title/author/thumbnail only — no view/like counts. The caller should
 *   prompt the user to paste stats manually in that case.
 */
export async function fetchYouTubeMetadata(url: string): Promise<VideoMetadata> {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error('Could not parse a YouTube video ID from that URL.');

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    const endpoint = new URL('https://www.googleapis.com/youtube/v3/videos');
    endpoint.searchParams.set('id', videoId);
    endpoint.searchParams.set('part', 'snippet,statistics,contentDetails');
    endpoint.searchParams.set('key', apiKey);

    const res = await fetch(endpoint.toString());
    if (!res.ok) throw new Error(`YouTube API error (${res.status}). Check YOUTUBE_API_KEY.`);
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) throw new Error('Video not found, private, or removed.');

    return {
      platform: 'YOUTUBE',
      url,
      title: item.snippet?.title ?? null,
      authorName: item.snippet?.channelTitle ?? null,
      thumbnailUrl: item.snippet?.thumbnails?.maxres?.url ?? item.snippet?.thumbnails?.high?.url ?? null,
      durationSec: item.contentDetails?.duration ? parseIsoDuration(item.contentDetails.duration) : null,
      viewCount: item.statistics?.viewCount ? Number(item.statistics.viewCount) : null,
      likeCount: item.statistics?.likeCount ? Number(item.statistics.likeCount) : null,
      commentCount: item.statistics?.commentCount ? Number(item.statistics.commentCount) : null,
      shareCount: null, // YouTube does not expose share counts via the API
      publishedAt: item.snippet?.publishedAt ?? null,
      statsAvailable: true,
    };
  }

  // Fallback: public oEmbed, no key required, no stats.
  const oembed = new URL('https://www.youtube.com/oembed');
  oembed.searchParams.set('url', url);
  oembed.searchParams.set('format', 'json');

  const res = await fetch(oembed.toString());
  if (!res.ok) throw new Error('Could not fetch this YouTube video (it may be private or removed).');
  const data = await res.json();

  return {
    platform: 'YOUTUBE',
    url,
    title: data.title ?? null,
    authorName: data.author_name ?? null,
    thumbnailUrl: data.thumbnail_url ?? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    durationSec: null,
    viewCount: null,
    likeCount: null,
    commentCount: null,
    shareCount: null,
    publishedAt: null,
    statsAvailable: false,
    needsManualStats: true,
  };
}
