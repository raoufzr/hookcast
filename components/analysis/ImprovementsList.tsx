import type { Improvement } from '@/types';
import { Badge } from '@/components/ui/Badge';

const IMPACT_TONE = { high: 'hook', medium: 'warn', low: 'neutral' } as const;
const ORDER = { high: 0, medium: 1, low: 2 };

export function ImprovementsList({ improvements }: { improvements: Improvement[] }) {
  const sorted = [...improvements].sort((a, b) => ORDER[a.expectedImpact] - ORDER[b.expectedImpact]);
  return (
    <ul className="space-y-3">
      {sorted.map((imp, i) => (
        <li key={i} className="flex items-start gap-3 rounded-md border border-ink/10 p-3">
          <Badge tone={IMPACT_TONE[imp.expectedImpact]} className="shrink-0">{imp.expectedImpact} impact</Badge>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-400">{imp.area}</p>
            <p className="text-sm text-ink-600">{imp.suggestion}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
