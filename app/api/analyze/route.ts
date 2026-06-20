import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { fetchVideoMetadata } from '@/lib/platforms';
import { analyzeVideo, generateImprovements } from '@/lib/claude';
import { assertUnderQuota, logUsage, QuotaExceededError } from '@/lib/usage';
import { isValidVideoUrl } from '@/lib/utils';
import type { VideoMetadata } from '@/types';

const ManualStats = z.object({
  title: z.string().optional(),
  authorName: z.string().optional(),
  viewCount: z.number().int().nonnegative().optional(),
  likeCount: z.number().int().nonnegative().optional(),
  commentCount: z.number().int().nonnegative().optional(),
  shareCount: z.number().int().nonnegative().optional(),
});

const RequestSchema = z.object({
  url: z.string().url(),
  transcript: z.string().max(20000).optional(),
  manualStats: ManualStats.optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please provide a valid YouTube, TikTok, or Instagram URL.' }, { status: 400 });
  }
  const { url, transcript, manualStats } = parsed.data;

  if (!isValidVideoUrl(url)) {
    return NextResponse.json({ error: 'That link is not a recognized YouTube, TikTok, or Instagram URL.' }, { status: 400 });
  }

  try {
    await assertUnderQuota(userId);
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      return NextResponse.json({ error: err.message, code: 'QUOTA_EXCEEDED' }, { status: 402 });
    }
    throw err;
  }

  let metadata: VideoMetadata;
  try {
    metadata = await fetchVideoMetadata(url);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not fetch video metadata.' },
      { status: 422 }
    );
  }

  // Manual stats fill in gaps the platform adapter couldn't provide
  // (always true for TikTok/Instagram, sometimes for YouTube).
  if (manualStats) {
    metadata = {
      ...metadata,
      title: metadata.title ?? manualStats.title ?? null,
      authorName: metadata.authorName ?? manualStats.authorName ?? null,
      viewCount: metadata.viewCount ?? manualStats.viewCount ?? null,
      likeCount: metadata.likeCount ?? manualStats.likeCount ?? null,
      commentCount: metadata.commentCount ?? manualStats.commentCount ?? null,
      shareCount: metadata.shareCount ?? manualStats.shareCount ?? null,
      statsAvailable: metadata.statsAvailable || Boolean(manualStats.viewCount),
    };
  }

  const record = await db.videoAnalysis.create({
    data: {
      userId,
      sourceUrl: url,
      platform: metadata.platform,
      status: 'ANALYZING',
      title: metadata.title,
      authorName: metadata.authorName,
      thumbnailUrl: metadata.thumbnailUrl,
      durationSec: metadata.durationSec,
      viewCount: metadata.viewCount !== null ? BigInt(metadata.viewCount) : null,
      likeCount: metadata.likeCount !== null ? BigInt(metadata.likeCount) : null,
      commentCount: metadata.commentCount !== null ? BigInt(metadata.commentCount) : null,
      shareCount: metadata.shareCount !== null ? BigInt(metadata.shareCount) : null,
      publishedAt: metadata.publishedAt ? new Date(metadata.publishedAt) : null,
      transcript: transcript ?? null,
    },
  });

  try {
    const analysis = await analyzeVideo(metadata, transcript);
    const improvements = await generateImprovements(metadata, analysis);

    await db.videoAnalysis.update({
      where: { id: record.id },
      data: {
        status: 'COMPLETE',
        viralityScore: analysis.viralityScore,
        verdict: analysis.verdict,
        analysisJson: analysis as unknown as object,
        improvements: improvements as unknown as object,
      },
    });
    await logUsage(userId, 'analyze');

    return NextResponse.json({ id: record.id });
  } catch (err) {
    await db.videoAnalysis.update({
      where: { id: record.id },
      data: { status: 'FAILED', errorMessage: err instanceof Error ? err.message : 'Analysis failed.' },
    });
    return NextResponse.json(
      { error: 'Claude could not complete the analysis. You have not been charged a credit for this attempt.', analysisId: record.id },
      { status: 502 }
    );
  }
}
