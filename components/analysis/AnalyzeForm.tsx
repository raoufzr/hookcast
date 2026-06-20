'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { detectPlatform } from '@/lib/utils';

const PLATFORM_LABEL: Record<string, string> = {
  YOUTUBE: 'YouTube',
  TIKTOK: 'TikTok',
  INSTAGRAM: 'Instagram',
};

export function AnalyzeForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({ viewCount: '', likeCount: '', commentCount: '', shareCount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platform = detectPlatform(url);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const manualStats = Object.fromEntries(
      Object.entries(stats)
        .filter(([, v]) => v.trim() !== '')
        .map(([k, v]) => [k, Number(v)])
    );

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          transcript: transcript.trim() || undefined,
          manualStats: Object.keys(manualStats).length ? manualStats : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setSubmitting(false);
        return;
      }
      router.push(`/dashboard/analysis/${data.id}`);
    } catch {
      setError('Network error — please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-600">Video URL</label>
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@creator/video/..."
            required
            type="url"
          />
          {platform && <Badge tone="hook" className="self-center whitespace-nowrap">{PLATFORM_LABEL[platform]}</Badge>}
        </div>
        <p className="mt-1 text-xs text-ink-400">YouTube Shorts/videos, TikTok, or Instagram Reel links.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-600">
          Transcript or on-screen text <span className="font-normal text-ink-400">(optional, but the analysis gets much more specific with it)</span>
        </label>
        <Textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste the spoken script, captions, or on-screen text..."
          rows={4}
        />
      </div>

      <button
        type="button"
        onClick={() => setShowStats((s) => !s)}
        className="text-sm font-medium text-hook-dim hover:underline"
      >
        {showStats ? 'Hide' : 'Add'} view/like/comment counts manually
      </button>
      {showStats && (
        <div className="grid grid-cols-2 gap-3 rounded-md bg-ink/5 p-4 sm:grid-cols-4">
          {(['viewCount', 'likeCount', 'commentCount', 'shareCount'] as const).map((field) => (
            <div key={field}>
              <label className="mb-1 block text-xs text-ink-400 capitalize">{field.replace('Count', 's')}</label>
              <Input
                type="number"
                min={0}
                value={stats[field]}
                onChange={(e) => setStats((s) => ({ ...s, [field]: e.target.value }))}
                placeholder="0"
              />
            </div>
          ))}
          <p className="col-span-2 text-xs text-ink-400 sm:col-span-4">
            TikTok and Instagram don&apos;t expose public stats via API, so paste them from the post for an accurate verdict.
          </p>
        </div>
      )}

      {error && <p className="rounded-md bg-hook-tint px-3 py-2 text-sm text-hook-dim">{error}</p>}

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? <Spinner /> : null}
        {submitting ? 'Analyzing with Claude…' : 'Analyze video'}
      </Button>
    </form>
  );
}
