import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { Badge } from '@/components/ui/Badge';
import { verdictLabel } from '@/lib/utils';

const VERDICT_TONE: Record<string, 'hook' | 'signal' | 'warn' | 'neutral'> = {
  VIRAL: 'hook',
  ABOVE_AVERAGE: 'signal',
  ORDINARY: 'neutral',
  UNDERPERFORMING: 'warn',
};

export function VerdictHero({
  score,
  verdict,
  summary,
  benchmarkNote,
}: {
  score: number;
  verdict: string;
  summary: string;
  benchmarkNote: string;
}) {
  return (
    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
      <ScoreGauge score={score} />
      <div className="flex-1">
        <Badge tone={VERDICT_TONE[verdict] ?? 'neutral'} className="mb-2 text-sm">
          {verdictLabel(verdict)}
        </Badge>
        <p className="text-ink-600">{summary}</p>
        <p className="mt-2 text-xs text-ink-400">{benchmarkNote}</p>
      </div>
    </div>
  );
}
