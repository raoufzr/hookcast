import type { VideoMetadata } from '@/types';

/**
 * TikTok has no public, key-based API for arbitrary video stats. Its
 * oEmbed endpoint (no auth required) returns title/author/thumbnail
 * only. View/like/comment/share counts always need to be pasted in
 * manually — the UI surfaces this clearly rather than faking numbers.
 */
export async function fetchTikTokMetadata(url: string): Promise<VideoMetadata> {
  const oembed = new URL('https://www.tiktok.com/oembed');
  oembed.searchParams.set('url', url);

  const res = await fetch(oembed.toString());
  if (!res.ok) throw new Error('Could not fetch this TikTok video (it may be private, removed, or region-locked).');
  const data = await res.json();

  return {
    platform: 'TIKTOK',
    url,
    title: data.title ?? null,
    authorName: data.author_name ?? null,
    thumbnailUrl: data.thumbnail_url ?? null,
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
