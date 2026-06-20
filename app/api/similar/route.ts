import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { findSimilarVideos } from '@/lib/claude';
import { logUsage } from '@/lib/usage';
import { serializeAnalysis } from '@/lib/serialize';
import type { AnalysisResult, VideoMetadata } from '@/types';

const RequestSchema = z.object({ analysisId: z.string() });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const parsed = RequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Missing analysisId.' }, { status: 400 });

  const record = await db.videoAnalysis.findFirst({ where: { id: parsed.data.analysisId, userId } });
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
    likeCount: null,
    commentCount: null,
    shareCount: null,
    publishedAt: null,
    statsAvailable: record.viewCount !== null,
  };

  const results = await findSimilarVideos(meta, record.analysisJson as unknown as AnalysisResult);

  await db.similarVideo.deleteMany({ where: { videoAnalysisId: record.id } });
  if (results.length > 0) {
    await db.similarVideo.createMany({
      data: results.map((r) => ({
        videoAnalysisId: record.id,
        platform: r.platform,
        url: r.url,
        title: r.title,
        authorName: r.authorName,
        thumbnailUrl: r.thumbnailUrl,
        viewCount: r.viewCount !== null ? BigInt(r.viewCount) : null,
        whySimilar: r.whySimilar,
      })),
    });
  }
  await logUsage(userId, 'similar');

  const updated = await db.videoAnalysis.findUnique({
    where: { id: record.id },
    include: { similarVideos: true, redesigns: true },
  });
  return NextResponse.json(serializeAnalysis(updated!, { similarVideos: updated!.similarVideos, redesigns: updated!.redesigns }));
}
