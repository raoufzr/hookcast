import type { VideoMetadata } from '@/types';

/**
 * Instagram retired unauthenticated oEmbed access; reading an
 * arbitrary public Reel's metadata now requires the Instagram Graph
 * API with an approved app and the *owner's* access token — it
 * cannot read a stranger's Reel by URL. So this adapter does not
 * call out to Instagram at all: it returns an empty shell and the
 * analyze flow asks the user to paste in the title/caption and
 * stats themselves (see AnalyzeForm's manual-stats panel).
 */
export async function fetchInstagramMetadata(url: string): Promise<VideoMetadata> {
  return {
    platform: 'INSTAGRAM',
    url,
    title: null,
    authorName: null,
    thumbnailUrl: null,
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
