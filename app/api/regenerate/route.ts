import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateRedesign } from '@/lib/claude';
import { logUsage } from '@/lib/usage';
import type { AnalysisResult, VideoMetadata } from '@/types';

const RequestSchema = z.object({
  analysisId: z.string(),
  focusNotes: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const parsed = RequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Missing analysisId.' }, { status: 400 });

  const record = await db.videoAnalysis.findFirst({
    where: { id: parsed.data.analysisId, userId },
  });
  if (!record || !record.analysisJson) {
    return NextResponse.json({ error: 'Analysis not found or not yet complete.' }, { status: 404 });
  }

  const meta: VideoMetadata = {
    platform: record.platform,
    url: record.sourceUrl,
    title: record.title,
    authorName: record.authorName,
    thumbnailUrl: record.thumbnailUrl,
    durationSec: record.durationSec,
    viewCount: record.viewCount !== null ? Number(record.viewCount) : null,
    likeCount: record.likeCount !== null ? Number(record.likeCount) : null,
    commentCount: record.commentCount !== null ? Number(record.commentCount) : null,
    shareCount: record.shareCount !== null ? Number(record.shareCount) : null,
    publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
    statsAvailable: record.viewCount !== null,
  };

  const redesign = await generateRedesign(meta, record.analysisJson as unknown as AnalysisResult, parsed.data.focusNotes);

  const saved = await db.redesignVersion.create({
    data: {
      videoAnalysisId: record.id,
      hook: redesign.hook,
      hookRationale: redesign.hookRationale,
      script: redesign.script,
      caption: redesign.caption,
      hashtags: redesign.hashtags,
    },
  });
  await logUsage(userId, 'regenerate');

  return NextResponse.json(saved);
}
