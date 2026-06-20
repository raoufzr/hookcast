import type { EditingAnalysis } from '@/types';

export function EditingCard({ editing }: { editing: EditingAnalysis }) {
  const rows: [string, string][] = [
    ['Cut frequency', editing.cutFrequency],
    ['Captions', editing.captionsUsed === null ? 'Unknown' : editing.captionsUsed ? 'Yes' : 'No'],
    ['Text overlays', editing.textOverlayUse],
    ['Audio', editing.audioNotes],
  ];
  return (
    <dl className="space-y-3">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-3 gap-3 text-sm">
          <dt className="text-ink-400">{label}</dt>
          <dd className="col-span-2 text-ink-600">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
