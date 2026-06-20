import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import type { VideoAnalysis } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AnalyzeForm } from '@/components/analysis/AnalyzeForm';
import { AnalysesList } from '@/components/analysis/AnalysesList';
import { getUsageThisMonth } from '@/lib/usage';
import { getPlan } from '@/lib/plans';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/signin');

  const [analyses, subscription, used] = await Promise.all([
    db.videoAnalysis.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
    db.subscription.findUnique({ where: { userId } }),
    getUsageThisMonth(userId),
  ]);
  const plan = getPlan(subscription?.plan);

  const items = analyses.map((a: VideoAnalysis) => ({
    id: a.id,
    title: a.title,
    authorName: a.authorName,
    thumbnailUrl: a.thumbnailUrl,
    platform: a.platform,
    status: a.status,
    verdict: a.verdict,
    viralityScore: a.viralityScore,
    viewCount: a.viewCount !== null ? Number(a.viewCount) : null,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold">Analyze a video</h1>
          <span className="text-xs text-ink-400">
            {used} / {plan.monthlyAnalyses} analyses used this month ({plan.name})
          </span>
        </div>
        <AnalyzeForm />
      </div>
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Your analyses</h2>
        <AnalysesList analyses={items} />
      </div>
    </div>
  );
}
