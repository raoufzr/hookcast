'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardContent } from '@/components/ui/Card';

export interface RedesignVersionView {
  id: string;
  hook: string;
  hookRationale: string;
  script: string;
  caption: string | null;
  hashtags: string[];
  createdAt: string;
}

export function RedesignPanel({ analysisId, initial }: { analysisId: string; initial: RedesignVersionView[] }) {
  const router = useRouter();
  const [versions, setVersions] = useState(initial);
  const [focusNotes, setFocusNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  async function regenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId, focusNotes: focusNotes.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not generate a redesign.');
        return;
      }
      setVersions((v) => [data, ...v]);
      router.refresh();
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  }

  const latest = versions[0];

  return (
    <div className="space-y-4">
      <Textarea
        value={focusNotes}
        onChange={(e) => setFocusNotes(e.target.value)}
        placeholder="Optional: tell Claude what to focus on (e.g. 'keep it under 20 seconds', 'make the hook a question')"
        rows={2}
      />
      <Button onClick={regenerate} disabled={loading} variant="primary">
        {loading ? <Spinner /> : null}
        {loading ? 'Rewriting…' : versions.length ? 'Regenerate again' : 'Generate hook & script redesign'}
      </Button>
      {error && <p className="text-sm text-hook-dim">{error}</p>}

      {latest && (
        <Card className="border-hook/20">
          <CardContent className="space-y-4 pt-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-hook-dim">New hook</p>
              <p className="mt-1 font-display text-lg font-semibold">{latest.hook}</p>
              <p className="mt-1 text-sm text-ink-400">{latest.hookRationale}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-400">Script</p>
              <pre className="mt-1 whitespace-pre-wrap font-body text-sm text-ink-600">{latest.script}</pre>
            </div>
            {latest.caption && (
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-400">Caption</p>
                <p className="mt-1 text-sm text-ink-600">{latest.caption}</p>
              </div>
            )}
            {latest.hashtags?.length > 0 && (
              <p className="font-mono text-xs text-ink-400">{latest.hashtags.map((h) => `#${h}`).join(' ')}</p>
            )}
          </CardContent>
        </Card>
      )}

      {versions.length > 1 && (
        <div>
          <button onClick={() => setExpanded((s) => !s)} className="text-xs font-medium text-ink-400 hover:underline">
            {expanded ? 'Hide' : 'Show'} {versions.length - 1} earlier version{versions.length - 1 > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
