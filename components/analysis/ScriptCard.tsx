import type { ScriptAnalysis } from '@/types';
import { Badge } from '@/components/ui/Badge';

export function ScriptCard({ script }: { script: ScriptAnalysis }) {
  return (
    <div className="space-y-4">
      <ol className="relative space-y-4 border-l border-ink/10 pl-5">
        {script.structure.map((beat, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-hook" />
            <p className="font-medium text-ink">{beat.label}</p>
            {(beat.startSec !== null || beat.endSec !== null) && (
              <p className="font-mono text-xs text-ink-400">
                {beat.startSec ?? '?'}s – {beat.endSec ?? '?'}s
              </p>
            )}
            <p className="mt-0.5 text-sm text-ink-600">{beat.notes}</p>
          </li>
        ))}
      </ol>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-400">Pacing</p>
          <p className="text-sm text-ink-600">{script.pacing}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-400">Payoff clarity</p>
          <p className="text-sm text-ink-600">{script.payoffClarity}</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Badge tone={script.ctaPresent ? 'signal' : 'warn'}>{script.ctaPresent ? 'Has a CTA' : 'No clear CTA'}</Badge>
        <p className="text-sm text-ink-600">{script.ctaNotes}</p>
      </div>
    </div>
  );
}
