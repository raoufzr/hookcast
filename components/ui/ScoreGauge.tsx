import { cn } from '@/lib/utils';

/**
 * A semicircular dial for the 0-100 virality score. Deliberately not
 * a generic progress ring — the needle + tick marks read like a VU
 * meter, tying back to the "broadcast" visual language used across
 * the product.
 */
export function ScoreGauge({ score, size = 140 }: { score: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const angle = -90 + (clamped / 100) * 180; // -90deg (left) to +90deg (right)
  const tone = clamped >= 70 ? 'text-hook' : clamped >= 45 ? 'text-warn' : 'text-ink-400';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 12} viewBox="0 0 140 82">
        <path d="M10 72 A60 60 0 0 1 130 72" fill="none" stroke="currentColor" className="text-ink/10" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M10 72 A60 60 0 0 1 130 72"
          fill="none"
          stroke="currentColor"
          className={tone}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * 188.5} 188.5`}
        />
        <line
          x1="70"
          y1="72"
          x2="70"
          y2="22"
          stroke="currentColor"
          className="text-ink"
          strokeWidth="2"
          transform={`rotate(${angle} 70 72)`}
        />
        <circle cx="70" cy="72" r="4" className="fill-ink" />
      </svg>
      <div className={cn('font-mono text-2xl font-medium -mt-2', tone)}>{clamped}</div>
      <div className="text-xs text-ink-400">/ 100</div>
    </div>
  );
}
