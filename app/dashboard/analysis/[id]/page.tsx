import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import type { RedesignVersion, SimilarVideo } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { VideoMetaCard } from '@/components/analysis/VideoMetaCard';
import { VerdictHero } from '@/components/analysis/VerdictHero';
import { HookCard } from '@/components/analysis/HookCard';
import { ScriptCard } from '@/components/analysis/ScriptCard';
import { EditingCard } from '@/components/analysis/EditingCard';
import { FactorsList } from '@/components/analysis/FactorsList';
import { ImprovementsList } from '@/components/analysis/ImprovementsList';
import { RedesignPanel } from '@/components/analysis/RedesignPanel';
import { SimilarVideosPanel } from '@/components/analysis/SimilarVideosPanel';
import type { AnalysisResult, Improvement } from '@/types';

export default async function AnalysisDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/signin');

  const record = await db.videoAnalysis.findFirst({
    where: { id: params.id, userId },
    include: { redesigns: { orderBy: { createdAt: 'desc' } }, similarVideos: true },
  });
  if (!record) notFound();

  if (record.status !== 'COMPLETE' || !record.analysisJson) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        {record.status === 'FAILED' ? (
          <>
            <p className="font-display text-lg font-semibold text-hook-dim">Analysis failed</p>
            <p className="max-w-sm text-sm text-ink-400">{record.errorMessage || 'Something went wrong while analyzing this video.'}</p>
          </>
        ) : (
          <>
            <Spinner className="h-6 w-6 text-hook" />
            <p className="text-sm text-ink-400">Still analyzing — refresh in a few seconds.</p>
          </>
        )}
      </div>
    );
  }

  const analysis = record.analysisJson as unknown as AnalysisResult;
  const improvements = (record.improvements as unknown as Improvement[]) ?? [];

  return (
    <div className="max-w-3xl space-y-8">
      <Card>
        <CardContent className="pt-5">
          <VideoMetaCard
            title={record.title}
            authorName={record.authorName}
            thumbnailUrl={record.thumbnailUrl}
            platform={record.platform}
            durationSec={record.durationSec}
            viewCount={record.viewCount !== null ? Number(record.viewCount) : null}
            likeCount={record.likeCount !== null ? Number(record.likeCount) : null}
            commentCount={record.commentCount !== null ? Number(record.commentCount) : null}
            shareCount={record.shareCount !== null ? Number(record.shareCount) : null}
            sourceUrl={record.sourceUrl}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <VerdictHero
            score={analysis.viralityScore}
            verdict={analysis.verdict}
            summary={analysis.summary}
            benchmarkNote={analysis.benchmarkNote}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>The hook (0–3s)</CardTitle></CardHeader>
        <CardContent><HookCard hook={analysis.hook} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Script & structure</CardTitle></CardHeader>
        <CardContent><ScriptCard script={analysis.script} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Editing & production</CardTitle></CardHeader>
        <CardContent><EditingCard editing={analysis.editing} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Why it {analysis.verdict === 'VIRAL' || analysis.verdict === 'ABOVE_AVERAGE' ? 'worked' : 'didn\u2019t break out'}</CardTitle></CardHeader>
        <CardContent><FactorsList factors={analysis.factors} /></CardContent>
      </Card>

      {improvements.length > 0 && (
        <Card>
          <CardHeader><CardTitle>What to fix next time</CardTitle></CardHeader>
          <CardContent><ImprovementsList improvements={improvements} /></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Redesign the hook & script</CardTitle></CardHeader>
        <CardContent>
          <RedesignPanel
            analysisId={record.id}
            initial={record.redesigns.map((r: RedesignVersion) => ({
              id: r.id,
              hook: r.hook,
              hookRationale: r.hookRationale,
              script: r.script,
              caption: r.caption,
              hashtags: r.hashtags,
              createdAt: r.createdAt.toISOString(),
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Similar videos worth studying</CardTitle></CardHeader>
        <CardContent>
          <SimilarVideosPanel
            analysisId={record.id}
            initial={record.similarVideos.map((s: SimilarVideo) => ({
              id: s.id,
              platform: s.platform,
              url: s.url,
              title: s.title,
              authorName: s.authorName,
              thumbnailUrl: s.thumbnailUrl,
              viewCount: s.viewCount !== null ? Number(s.viewCount) : null,
              whySimilar: s.whySimilar,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
