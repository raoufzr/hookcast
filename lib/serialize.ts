import type { RedesignVersion, SimilarVideo, VideoAnalysis } from '@prisma/client';

// Prisma's BigInt fields (view/like/comment/share counts) don't survive
// NextResponse.json() — JSON.stringify throws on BigInt. Convert the
// whole record to plain JSON-safe numbers/strings for API responses.
function toNumber(v: bigint | null): number | null {
  return v === null ? null : Number(v);
}

export function serializeAnalysis(
  a: VideoAnalysis,
  related?: { redesigns?: RedesignVersion[]; similarVideos?: SimilarVideo[] }
) {
  return {
    id: a.id,
    sourceUrl: a.sourceUrl,
    platform: a.platform,
    status: a.status,
    errorMessage: a.errorMessage,
    title: a.title,
    authorName: a.authorName,
    thumbnailUrl: a.thumbnailUrl,
    durationSec: a.durationSec,
    viewCount: toNumber(a.viewCount),
    likeCount: toNumber(a.likeCount),
    commentCount: toNumber(a.commentCount),
    shareCount: toNumber(a.shareCount),
    publishedAt: a.publishedAt,
    transcript: a.transcript,
    viralityScore: a.viralityScore,
    verdict: a.verdict,
    analysis: a.analysisJson,
    improvements: a.improvements,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    redesigns:
      related?.redesigns?.map((r) => ({
        id: r.id,
        hook: r.hook,
        hookRationale: r.hookRationale,
        script: r.script,
        caption: r.caption,
        hashtags: r.hashtags,
        createdAt: r.createdAt,
      })) ?? [],
    similarVideos:
      related?.similarVideos?.map((s) => ({
        id: s.id,
        platform: s.platform,
        url: s.url,
        title: s.title,
        authorName: s.authorName,
        thumbnailUrl: s.thumbnailUrl,
        viewCount: toNumber(s.viewCount),
        whySimilar: s.whySimilar,
      })) ?? [],
  };
}
