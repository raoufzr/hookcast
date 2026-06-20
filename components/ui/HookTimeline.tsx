import { cn } from '@/lib/utils';

/**
 * Signature visual: a horizontal timeline with second-by-second ticks
 * and the 0-3s "hook window" called out. Reused on the landing hero
 * and (in a data-driven form) on the analysis detail page.
 */
export function HookTimeline({ className, label = 'THE HOOK WINDOW' }: { className?: string; label?: string }) {
  const ticks = Array.from({ length: 16 });
  return (
    <div className={cn('relative', className)}>
      <div className="flex h-12 items-end gap-[3px] rounded-md bg-ink-800 px-3 pb-2 pt-3">
        {ticks.map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 rounded-sm',
              i < 3 ? 'bg-hook' : 'bg-paper/20',
              i === 0 && 'h-full',
              i === 1 && 'h-4/5',
              i === 2 && 'h-3/5',
              i > 2 && i % 3 === 0 && 'h-3/5',
              i > 2 && i % 3 !== 0 && 'h-2/5'
            )}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-ink-400">
        <span className="text-hook-dim font-medium">0:00 — {label}</span>
        <span>0:03</span>
        <span>0:{ticks.length}</span>
      </div>
    </div>
  );
}
