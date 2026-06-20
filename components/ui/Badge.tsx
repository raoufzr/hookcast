import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'hook' | 'signal' | 'warn' | 'neutral';

const toneClasses: Record<Tone, string> = {
  hook: 'bg-hook-tint text-hook-dim',
  signal: 'bg-signal-tint text-signal',
  warn: 'bg-warn-tint text-warn',
  neutral: 'bg-ink/5 text-ink-600',
};

export function Badge({ tone = 'neutral', className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium uppercase tracking-wide',
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
