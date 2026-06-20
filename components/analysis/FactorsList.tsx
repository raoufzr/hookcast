import type { AnalysisFactor } from '@/types';
import { Badge } from '@/components/ui/Badge';

const TONE = { positive: 'signal', negative: 'hook', neutral: 'neutral' } as const;

export function FactorsList({ factors }: { factors: AnalysisFactor[] }) {
  return (
    <ul className="space-y-3">
      {factors.map((f, i) => (
        <li key={i} className="flex gap-3">
          <Badge tone={TONE[f.impact]} className="mt-0.5 h-fit shrink-0">{f.impact}</Badge>
          <div>
            <p className="text-sm font-medium text-ink">{f.label}</p>
            <p className="text-sm text-ink-600">{f.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
