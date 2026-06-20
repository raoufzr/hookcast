# Hookcast — Product Requirements Document

## 1. Executive summary

Short-form video (YouTube Shorts, TikTok, Instagram Reels) is now most creators' and brands' primary growth channel, but almost no one can explain *why* a specific video did or didn't take off — they iterate by vibes. Hookcast takes a video URL, pulls whatever metadata the platform exposes, and uses Claude to produce a structural diagnosis: hook type and strength, script pacing and payoff, editing choices, a viral/ordinary verdict benchmarked to the platform, and a rewritten hook and script that target the specific weaknesses found. It also searches the web for real videos in a similar lane that are known to have worked, so creators have concrete references, not just abstract advice.

**Primary value proposition:** turn "why did this work?" from a guess into a structured, repeatable diagnostic — and turn the diagnosis into a usable rewrite, not just a score.

## 2. Target customers

- **Solo short-form creators** (10K–500K followers) iterating on format/hook before they have an editor or strategist.
- **Social media managers / agencies** running multiple client accounts who need to justify creative decisions and standardize a review process across accounts.
- **Brand marketing teams** producing UGC-style ads who want a consistent quality bar before spending media dollars behind a video.

## 3. Competitive landscape & differentiation

Existing tools split into two camps: (a) raw analytics dashboards (e.g., platform-native Creator Studio, or aggregators like Social Blade) that show *what* happened (views over time) but not *why*, and (b) generic AI writing tools that generate hooks/scripts from scratch with no grounding in a specific video's actual performance or weaknesses.

Hookcast's differentiation is doing both steps in one flow, grounded in the actual video: diagnose a real video's structure first, *then* generate a fix that's targeted at what the diagnosis found weak — plus surfacing real comparable videos rather than only abstract advice.

## 4. Core user stories

1. As a creator, I paste a link to a video that flopped and get a clear explanation of what about the hook or structure likely caused it, so I know what to change.
2. As a creator, I paste a link to a video of mine that did well and get confirmation of *why*, so I can repeat the pattern deliberately instead of by accident.
3. As an agency social media manager, I run every client video through Hookcast before it posts, building a paper trail of structural reasoning behind creative choices.
4. As a creator without a transcript handy, I can still get a useful (if less granular) analysis from title, caption, and stats alone, and the app is upfront about that limitation rather than fabricating detail.
5. As a creator, I get a literal rewritten hook and script I can read on camera, not just bullet-point advice.
6. As a creator, I see 3–5 real videos with a similar hook/format that performed well, with a one-line explanation of the similarity, so I have concrete references.
7. As a free user, I hit a monthly analysis cap and get a clear upgrade path rather than a silent failure.

## 5. Feature scope (v1)

- Video URL ingestion for YouTube, TikTok, Instagram, with platform auto-detection.
- Optional transcript/on-screen-text paste for higher-fidelity analysis.
- Manual stats entry as a fallback when a platform doesn't expose public counts (always true for TikTok/Instagram; sometimes for YouTube — see Architecture doc).
- Claude-generated structured analysis: virality score (0–100), verdict (Viral / Above average / Ordinary / Underperforming), hook breakdown, script/structure breakdown, editing breakdown, ranked contributing factors, benchmark note.
- Ranked, actionable improvement list.
- On-demand hook + script redesign, with optional creator focus notes, versioned (regenerate as many times as the plan allows).
- On-demand similar-video search via Claude's web search, returning real, verifiable URLs only — no fabricated links.
- Analysis history per user.
- Free / Pro / Agency subscription tiers via Stripe, with monthly analysis quotas enforced server-side.

## 6. Out of scope for v1 (explicitly deferred)

- Background job queue for analysis (currently synchronous within the API request — acceptable for MVP traffic, but a multi-minute Claude call inside a single serverless request will need to move to a queue + polling/webhook pattern before this scales past a few hundred concurrent analyses; see Architecture doc).
- Native video upload / frame-by-frame visual analysis (v1 reasons from metadata + transcript + stats only, not pixels — see Architecture doc's note on why a real Instagram/TikTok scraping integration is a deliberate non-goal for v1).
- Team accounts / multi-seat permissions (Agency plan is single-seat in v1; the data model has room to add org-level sharing later).
- CSV/PDF export of analyses.
- Mobile app (responsive web only).
- Editing the video itself (no video processing pipeline).

## 7. Pricing

| Plan | Price | Analyses/mo | Notes |
|---|---|---|---|
| Free | $0 | 3 | Full breakdown, 1 redesign per analysis |
| Pro | $29/mo | 100 | Unlimited redesigns, similar-video search, priority queue |
| Agency | $99/mo | 500 | Everything in Pro, bulk export (planned), email support |

Limits and copy live in a single source of truth at `lib/plans.ts` so pricing changes don't require touching UI or billing logic separately.

## 8. Success metrics

- **Activation:** % of signups who complete at least one analysis within 24 hours.
- **Depth of use:** average redesigns generated per analysis (signals whether the rewrite is actually useful, not just the score).
- **Retention:** % of free users who return for a second analysis in a different week.
- **Conversion:** free → paid conversion rate, and the analysis-count at which users typically convert (informs whether 3/mo is the right free cap).
- **Quality proxy:** thumbs-up/down on analyses (not yet built — first thing to add post-launch to validate Claude's analysis quality against creator judgment).

## 9. Launch checklist

- [ ] Set production `ANTHROPIC_API_KEY`, `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
- [ ] Set `YOUTUBE_API_KEY` if full YouTube stats are desired (optional — degrades to oEmbed without it).
- [ ] Create Stripe products/prices for Pro and Agency; set `NEXT_PUBLIC_STRIPE_PRICE_PRO/AGENCY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; register the production webhook endpoint.
- [ ] Run `npm run db:migrate` (switch from `db:push` to real migrations before production).
- [ ] Verify `middleware.ts` correctly blocks `/dashboard/*` when signed out.
- [ ] Load-test a single analysis end-to-end (metadata fetch + 3 Claude calls) to confirm it completes within your hosting platform's request timeout — this is the main reason a queue is recommended before scaling (see Architecture doc, "Known scaling limit").
- [ ] Add a privacy policy / terms page (not included — legal copy is out of scope for this scaffold).
- [ ] Confirm Anthropic and Stripe usage-based costs are within budget for the free-tier quota you've chosen (3 analyses × however many free signups you expect).

## 10. Growth ideas (post-v1)

- Public "viral teardown" pages for a handful of well-known videos, generated once and indexed for SEO, that funnel into signup.
- A Chrome extension that adds an "Analyze with Hookcast" button directly on TikTok/YouTube/Instagram video pages.
- Slack/email weekly digest of a creator's analyses and trend in their own virality scores over time.
- An "analyze a competitor's channel" batch mode for the Agency tier (feeds directly off the existing single-analysis pipeline).
