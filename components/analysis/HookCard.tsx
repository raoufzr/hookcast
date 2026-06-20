import type { HookAnalysis } from '@/types';
import { ScoreGauge } from '@/components/ui/ScoreGauge';

export function HookCard({ hook }: { hook: HookAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-400">Hook type</p>
          <p className="font-display text-lg font-semibold">{hook.type}</p>
        </div>
        <ScoreGauge score={hook.strengthScore} size={96} />
      </div>

      {hook.transcriptExcerpt && (
        <blockquote className="rounded-md border-l-4 border-hook bg-hook-tint px-4 py-2 font-mono text-sm text-ink-800">
          “{hook.transcriptExcerpt}”
        </blockquote>
      )}

      {hook.beats.length > 0 && (
        <ol className="space-y-1.5">
          {hook.beats.map((b, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="w-10 shrink-0 font-mono text-ink-400">{b.timestampSec}s</span>
              <span className="text-ink-600">{b.description}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-signal">What works</p>
          <ul className="space-y-1 text-sm text-ink-600">
            {hook.whatWorks.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-hook-dim">What&apos;s weak</p>
          <ul className="space-y-1 text-sm text-ink-600">
            {hook.whatsWeak.length ? hook.whatsWeak.map((w, i) => <li key={i}>• {w}</li>) : <li className="text-ink-400">Nothing notable.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
