import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Platform } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCount(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K`;
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(n < 10_000_000 ? 1 : 0)}M`;
  return `${(n / 1_000_000_000).toFixed(1)}B`;
}

export function formatDuration(sec: number | null | undefined): string {
  if (!sec && sec !== 0) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

const PLATFORM_PATTERNS: { platform: Platform; pattern: RegExp }[] = [
  { platform: 'YOUTUBE', pattern: /(youtube\.com|youtu\.be)/i },
  { platform: 'TIKTOK', pattern: /tiktok\.com/i },
  { platform: 'INSTAGRAM', pattern: /instagram\.com/i },
];

export function detectPlatform(url: string): Platform | null {
  for (const { platform, pattern } of PLATFORM_PATTERNS) {
    if (pattern.test(url)) return platform;
  }
  return null;
}

export function isValidVideoUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return Boolean(detectPlatform(u.toString()));
  } catch {
    return false;
  }
}

export function verdictLabel(v: string): string {
  switch (v) {
    case 'VIRAL':
      return 'Viral';
    case 'ABOVE_AVERAGE':
      return 'Above average';
    case 'ORDINARY':
      return 'Ordinary';
    case 'UNDERPERFORMING':
      return 'Underperforming';
    default:
      return v;
  }
}
