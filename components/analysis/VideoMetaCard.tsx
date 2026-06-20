import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { formatCount, formatDuration } from '@/lib/utils';

interface Props {
  title: string | null;
  authorName: string | null;
  thumbnailUrl: string | null;
  platform: string;
  durationSec: number | null;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
  shareCount: number | null;
  sourceUrl: string;
}

export function VideoMetaCard(props: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative h-44 w-32 shrink-0 overflow-hidden rounded-md bg-ink-800 sm:h-40 sm:w-28">
        {props.thumbnailUrl ? (
          <Image src={props.thumbnailUrl} alt={props.title ?? 'Video thumbnail'} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-paper/40">No thumbnail</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Badge tone="neutral" className="mb-2">{props.platform}</Badge>
        <h2 className="line-clamp-2 font-display text-lg font-semibold">{props.title ?? 'Untitled video'}</h2>
        <p className="mt-1 text-sm text-ink-400">{props.authorName ?? 'Unknown creator'}</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
          <Stat label="Views" value={formatCount(props.viewCount)} />
          <Stat label="Likes" value={formatCount(props.likeCount)} />
          <Stat label="Comments" value={formatCount(props.commentCount)} />
          <Stat label="Duration" value={formatDuration(props.durationSec)} />
        </dl>
        <a
          href={props.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-xs font-medium text-hook-dim hover:underline"
        >
          View original ↗
        </a>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-400">{label}</dt>
      <dd className="font-mono font-medium text-ink">{value}</dd>
    </div>
  );
}
