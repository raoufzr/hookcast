import type { Platform, VideoMetadata } from '@/types';
import { detectPlatform } from '@/lib/utils';
import { fetchYouTubeMetadata } from './youtube';
import { fetchTikTokMetadata } from './tiktok';
import { fetchInstagramMetadata } from './instagram';

const ADAPTERS: Record<Platform, (url: string) => Promise<VideoMetadata>> = {
  YOUTUBE: fetchYouTubeMetadata,
  TIKTOK: fetchTikTokMetadata,
  INSTAGRAM: fetchInstagramMetadata,
};

export async function fetchVideoMetadata(url: string): Promise<VideoMetadata> {
  const platform = detectPlatform(url);
  if (!platform) {
    throw new Error('That doesn\'t look like a YouTube, TikTok, or Instagram link.');
  }
  return ADAPTERS[platform](url);
}
