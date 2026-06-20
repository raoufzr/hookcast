'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatCount } from '@/lib/utils';

export interface SimilarVideoView {
  id: string;
  platform: string;
  url: string;
  title: string | null;
  authorName: string | null;
  thumbnailUrl: string | null;
  viewCount: number | null;
  whySimilar: string | null;
}

export function SimilarVideosPanel({ analysisId, initial }: { analysisId: string; initial: SimilarVideoView[] }) {
  const [videos, setVideos] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(initial.length > 0);

  async function findSimilar() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not search for similar videos.');
        return;
      }
      setVideos(data.similarVideos ?? []);
      setSearched(true);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={findSimilar} disabled={loading} variant="secondary">
        {loading ? <Spinner /> : null}
        {loading ? 'Searching the web…' : searched ? 'Search again' : 'Find similar viral videos'}
      </Button>
      {error && <p className="text-sm text-hook-dim">{error}</p>}
      {searched && videos.length === 0 && !loading && !error && (
        <p className="text-sm text-ink-400">Claude couldn&apos;t verify any close matches with a real, checkable URL this time.</p>
      )}
      {videos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <a
              key={v.id}
              href={v.url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-md border border-ink/10 transition-shadow hover:shadow-card"
            >
              <div className="relative h-36 bg-ink-800">
                {v.thumbnailUrl ? (
                  <Image src={v.thumbnailUrl} alt={v.title ?? 'Similar video'} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-paper/40">{v.platform}</div>
                )}
              </div>
              <div className="space-y-1.5 p-3">
                <Badge tone="neutral">{v.platform}</Badge>
                <p className="line-clamp-2 text-sm font-medium text-ink">{v.title ?? 'Untitled'}</p>
                <p className="text-xs text-ink-400">{v.authorName ?? 'Unknown creator'} · {formatCount(v.viewCount)} views</p>
                {v.whySimilar && <p className="text-xs text-ink-600">{v.whySimilar}</p>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
