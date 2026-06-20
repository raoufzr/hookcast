// Shared types used across lib/, components/, and app/.
// These mirror (but stay independent of) the Prisma `Json` fields on
// VideoAnalysis, so the API and UI have a typed contract for data that
// Prisma itself can't type-check.

export type Platform = 'YOUTUBE' | 'TIKTOK' | 'INSTAGRAM';

export type Verdict = 'VIRAL' | 'ABOVE_AVERAGE' | 'ORDINARY' | 'UNDERPERFORMING';

export interface VideoMetadata {
  platform: Platform;
  url: string;
  title: string | null;
  authorName: string | null;
  thumbnailUrl: string | null;
  durationSec: number | null;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
  shareCount: number | null;
  publishedAt: string | null; // ISO date
  /** True when counts came from a real platform API/oEmbed call. */
  statsAvailable: boolean;
  /** Set when stats are missing and the UI should ask the user to paste them. */
  needsManualStats?: boolean;
}

/** One beat of the hook (the first ~3 seconds). */
export interface HookBeat {
  timestampSec: number;
  description: string;
}

export interface HookAnalysis {
  type: string; // e.g. "pattern interrupt", "open loop", "bold claim", "relatable problem"
  transcriptExcerpt: string | null;
  beats: HookBeat[];
  strengthScore: number; // 0-100
  whatWorks: string[];
  whatsWeak: string[];
}

export interface StructureBeat {
  label: string; // "Hook", "Setup", "Escalation", "Payoff", "CTA"
  startSec: number | null;
  endSec: number | null;
  notes: string;
}

export interface ScriptAnalysis {
  structure: StructureBeat[];
  pacing: string;
  payoffClarity: string;
  ctaPresent: boolean;
  ctaNotes: string;
}

export interface EditingAnalysis {
  cutFrequency: string; // qualitative: "fast (sub-1s cuts)" etc.
  captionsUsed: boolean | null;
  textOverlayUse: string;
  audioNotes: string; // trending sound, voiceover, music choice
}

export interface AnalysisFactor {
  label: string;
  detail: string;
  impact: 'positive' | 'negative' | 'neutral';
}

/** The full structured result of analyzing a video, stored as JSON. */
export interface AnalysisResult {
  viralityScore: number; // 0-100
  verdict: Verdict;
  summary: string;
  hook: HookAnalysis;
  script: ScriptAnalysis;
  editing: EditingAnalysis;
  factors: AnalysisFactor[]; // ranked reasons it over/under-performed
  benchmarkNote: string; // how this compares to typical videos on the platform
}

export interface Improvement {
  area: 'hook' | 'script' | 'editing' | 'cta' | 'metadata' | 'other';
  suggestion: string;
  expectedImpact: 'high' | 'medium' | 'low';
}

export interface RedesignResult {
  hook: string;
  hookRationale: string;
  script: string;
  caption: string;
  hashtags: string[];
}

export interface SimilarVideoResult {
  platform: Platform;
  url: string;
  title: string | null;
  authorName: string | null;
  thumbnailUrl: string | null;
  viewCount: number | null;
  whySimilar: string;
}

// ---------- Plans ----------

export interface Plan {
  id: 'FREE' | 'PRO' | 'AGENCY';
  name: string;
  price: number; // USD / month
  monthlyAnalyses: number;
  features: string[];
  stripePriceEnvVar?: 'NEXT_PUBLIC_STRIPE_PRICE_PRO' | 'NEXT_PUBLIC_STRIPE_PRICE_AGENCY';
}
