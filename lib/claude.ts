import Anthropic from '@anthropic-ai/sdk';
import type {
  AnalysisResult,
  Improvement,
  RedesignResult,
  SimilarVideoResult,
  VideoMetadata,
} from '@/types';

let _client: Anthropic | null = null;

function client(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set. Add it to .env.local — see README.md.');
  }
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

/**
 * Pulls the first complete JSON value (object or array) out of a
 * model response, tolerating stray prose or ```json fences around it.
 * Claude is instructed to return raw JSON, but this keeps the app
 * from hard-failing if it doesn't.
 */
function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start === -1) throw new Error('Claude response did not contain JSON.');
  const opener = candidate[start];
  const closer = opener === '{' ? '}' : ']';
  let depth = 0;
  let end = -1;
  for (let i = start; i < candidate.length; i++) {
    if (candidate[i] === opener) depth++;
    else if (candidate[i] === closer) {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) throw new Error('Could not find balanced JSON in Claude response.');
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}

function metaBlock(meta: VideoMetadata, transcript?: string | null): string {
  return [
    `Platform: ${meta.platform}`,
    `URL: ${meta.url}`,
    `Title/caption: ${meta.title ?? '(not provided)'}`,
    `Creator: ${meta.authorName ?? '(not provided)'}`,
    `Duration: ${meta.durationSec ? `${meta.durationSec}s` : '(not provided)'}`,
    `Views: ${meta.viewCount ?? '(not provided)'}`,
    `Likes: ${meta.likeCount ?? '(not provided)'}`,
    `Comments: ${meta.commentCount ?? '(not provided)'}`,
    `Shares: ${meta.shareCount ?? '(not provided)'}`,
    `Published: ${meta.publishedAt ?? '(not provided)'}`,
    `Transcript / spoken+on-screen text (if supplied by the user):`,
    transcript?.trim() ? transcript.trim() : '(not provided — base the analysis on title, caption, and any stats given. Say so explicitly rather than inventing dialogue.)',
  ].join('\n');
}

const ANALYSIS_SYSTEM_PROMPT = `You are a short-form video strategist who has studied thousands of viral YouTube Shorts, TikToks, and Instagram Reels. You analyze a single video's metadata, stats, and (when given) transcript to judge whether it performed like a viral video or an ordinary one for its platform and niche, and to break down exactly why.

Rules:
- Judge "viral" relative to the platform and what's plausible for the creator's apparent size, not an absolute view count. If stats are missing, say so in benchmarkNote and lean on structural/hook quality instead of guessing numbers.
- Never invent transcript content, dialogue, or on-screen text that wasn't provided. If there's no transcript, analyze what's inferable from the title, caption, and thumbnail context, and note the limitation.
- Be specific and concrete, not generic ("strong pattern-interrupt that contradicts the thumbnail's implied claim" not "good hook").
- Respond with ONLY a single JSON object, no prose before or after, matching exactly this TypeScript shape:

{
  "viralityScore": number, // 0-100
  "verdict": "VIRAL" | "ABOVE_AVERAGE" | "ORDINARY" | "UNDERPERFORMING",
  "summary": string, // 2-3 sentences
  "hook": {
    "type": string,
    "transcriptExcerpt": string | null,
    "beats": [{ "timestampSec": number, "description": string }],
    "strengthScore": number, // 0-100
    "whatWorks": string[],
    "whatsWeak": string[]
  },
  "script": {
    "structure": [{ "label": string, "startSec": number | null, "endSec": number | null, "notes": string }],
    "pacing": string,
    "payoffClarity": string,
    "ctaPresent": boolean,
    "ctaNotes": string
  },
  "editing": {
    "cutFrequency": string,
    "captionsUsed": boolean | null,
    "textOverlayUse": string,
    "audioNotes": string
  },
  "factors": [{ "label": string, "detail": string, "impact": "positive" | "negative" | "neutral" }],
  "benchmarkNote": string
}`;

export async function analyzeVideo(meta: VideoMetadata, transcript?: string | null): Promise<AnalysisResult> {
  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: 3000,
    temperature: 0.3,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: metaBlock(meta, transcript) }],
  });
  const text = msg.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('Claude returned no analysis text.');
  return extractJson<AnalysisResult>(text.text);
}

const IMPROVEMENTS_SYSTEM_PROMPT = `You turn a video analysis into a short, prioritized list of concrete improvements the creator could make on their NEXT video. Respond with ONLY a JSON array, no prose, matching:

[{ "area": "hook" | "script" | "editing" | "cta" | "metadata" | "other", "suggestion": string, "expectedImpact": "high" | "medium" | "low" }]

Give 4-7 items, ordered by expectedImpact (high first). Be specific and actionable, never generic platitudes like "make it more engaging."`;

export async function generateImprovements(meta: VideoMetadata, analysis: AnalysisResult): Promise<Improvement[]> {
  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: 1200,
    temperature: 0.4,
    system: IMPROVEMENTS_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `${metaBlock(meta)}\n\nExisting analysis JSON:\n${JSON.stringify(analysis)}`,
      },
    ],
  });
  const text = msg.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('Claude returned no improvements text.');
  return extractJson<Improvement[]>(text.text);
}

const REDESIGN_SYSTEM_PROMPT = `You rewrite a short-form video's hook and script to fix the weaknesses identified in its analysis, while keeping the same core topic and the creator's apparent voice. Write an actual hook line and an actual beat-by-beat script (not a description of what the script should do).

Respond with ONLY a JSON object, no prose, matching:
{
  "hook": string,        // the literal first line(s) spoken/shown, 0-3s
  "hookRationale": string, // why this hook fixes the weaknesses found
  "script": string,      // the full beat-by-beat script with timestamps, as plain text with line breaks
  "caption": string,     // a ready-to-post caption for the platform
  "hashtags": string[]   // 5-8 relevant hashtags, no leading #
}`;

export async function generateRedesign(
  meta: VideoMetadata,
  analysis: AnalysisResult,
  focusNotes?: string
): Promise<RedesignResult> {
  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: 2000,
    temperature: 0.7,
    system: REDESIGN_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          metaBlock(meta),
          `\nAnalysis JSON:\n${JSON.stringify(analysis)}`,
          focusNotes?.trim() ? `\nThe creator specifically wants you to focus on: ${focusNotes.trim()}` : '',
        ].join('\n'),
      },
    ],
  });
  const text = msg.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('Claude returned no redesign text.');
  return extractJson<RedesignResult>(text.text);
}

const SIMILAR_SYSTEM_PROMPT = `You find real, currently findable short-form videos (YouTube Shorts, TikToks, or Instagram Reels) that are similar in topic, hook style, or format to the one described, and that are known to have performed well. Use web search to find actual videos with real URLs — never invent a URL. If you can't verify a real URL for a plausible match, omit it rather than guessing.

After researching, respond with ONLY a JSON array, no prose before or after, of up to 5 items matching:
[{ "platform": "YOUTUBE" | "TIKTOK" | "INSTAGRAM", "url": string, "title": string | null, "authorName": string | null, "thumbnailUrl": null, "viewCount": number | null, "whySimilar": string }]

Always set "thumbnailUrl" to null — the app fetches thumbnails separately. Write "whySimilar" as one specific sentence in your own words (do not quote the source verbatim).`;

export async function findSimilarVideos(meta: VideoMetadata, analysis: AnalysisResult): Promise<SimilarVideoResult[]> {
  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: 2000,
    temperature: 0.4,
    system: SIMILAR_SYSTEM_PROMPT,
    // Server-side web search tool — Anthropic executes the search itself
    // and returns search-grounded content. Typed loosely here since the
    // exact nested tool-param type name has moved across SDK versions;
    // the shape itself (type + name) is the stable, documented contract.
    tools: [{ type: 'web_search_20250305', name: 'web_search' }] as unknown as Anthropic.Tool[],
    messages: [
      {
        role: 'user',
        content: `${metaBlock(meta)}\n\nWhat made it work / not work:\n${analysis.summary}\nHook type: ${analysis.hook.type}`,
      },
    ],
  });

  const combined = msg.content
    .filter((b): b is { type: 'text'; text: string } => b.type === 'text' && typeof (b as { text?: unknown }).text === 'string')
    .map((b) => b.text)
    .join('\n');
  if (!combined.trim()) return [];

  try {
    return extractJson<SimilarVideoResult[]>(combined);
  } catch {
    // Model occasionally narrates around the JSON despite instructions —
    // fail soft with an empty list rather than breaking the whole analysis.
    return [];
  }
}
