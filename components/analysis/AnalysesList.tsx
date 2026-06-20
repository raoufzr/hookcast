'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { formatCount, verdictLabel } from '@/lib/utils';

export interface AnalysisListItem {
  id: string;
  title: string | null;
  authorName: string | null;
  thumbnailUrl: string | null;
  platform: string;
  status: string;
  verdict: string | null;
  viralityScore: number | null;
  viewCount: number | null;
  createdAt: string;
}

const VERDICT_TONE: Record<string, 'hook' | 'signal' | 'warn' | 'neutral'> = {
  VIRAL: 'hook',
  ABOVE_AVERAGE: 'signal',
  ORDINARY: 'neutral',
  UNDERPERFORMING: 'warn',
};

export function AnalysesList({ analyses }: { analyses: AnalysisListItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(analyses);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  async function remove(id: string) {
    setPendingDelete(id);
    const res = await fetch(`/api/analyses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setItems((curr) => curr.filter((a) => a.id !== id));
      router.refresh();
    }
    setPendingDelete(null);
  }

  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-ink/20 px-6 py-10 text-center text-sm text-ink-400">
        No analyses yet — paste a video URL above to get your first breakdown.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-ink/10 rounded-lg border border-ink/10 bg-white">
      {items.map((a) => (
        <li key={a.id} className="flex items-center gap-4 p-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-ink-800">
            {a.thumbnailUrl && <Image src={a.thumbnailUrl} alt="" fill className="object-cover" unoptimized />}
          </div>
          <Link href={`/dashboard/analysis/${a.id}`} className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{a.title ?? 'Untitled video'}</p>
            <p className="text-xs text-ink-400">
              {a.platform} · {a.authorName ?? 'Unknown'} · {formatCount(a.viewCount)} views
            </p>
          </Link>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            {a.status === 'COMPLETE' && a.verdict ? (
              <>
                <Badge tone={VERDICT_TONE[a.verdict] ?? 'neutral'}>{verdictLabel(a.verdict)}</Badge>
                <span className="font-mono text-sm text-ink-400">{a.viralityScore}</span>
              </>
            ) : a.status === 'FAILED' ? (
              <Badge tone="warn">Failed</Badge>
            ) : (
              <Badge tone="neutral">Processing…</Badge>
            )}
          </div>
          <button
            onClick={() => remove(a.id)}
            disabled={pendingDelete === a.id}
            className="shrink-0 text-xs text-ink-400 hover:text-hook-dim"
          >
            {pendingDelete === a.id ? '…' : 'Delete'}
          </button>
        </li>
      ))}
    </ul>
  );
}
