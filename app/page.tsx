import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { HookTimeline } from '@/components/ui/HookTimeline';

const FEATURES = [
  {
    title: 'Viral or ordinary — with a verdict, not a guess',
    body: 'A 0-100 score benchmarked against what\u2019s plausible for the platform and creator size, not a generic "engagement" number.',
  },
  {
    title: 'Hook, script, and editing — broken down separately',
    body: 'The 0-3s hook type and strength, the beat-by-beat structure, pacing, payoff, and the editing choices that shaped retention.',
  },
  {
    title: 'A redesigned hook and script, on demand',
    body: 'Claude rewrites the opening line and the full script to fix exactly what the analysis flagged as weak — not a generic rewrite.',
  },
  {
    title: 'Find what else is working in the same lane',
    body: 'Claude searches the web for real, verifiable videos with a similar hook or format that are known to have performed well.',
  },
];

const STEPS = [
  { n: '01', title: 'Paste a link', body: 'A YouTube Short, TikTok, or Instagram Reel URL. Add a transcript for sharper results.' },
  { n: '02', title: 'Claude breaks it down', body: 'Hook type and strength, script structure, pacing, editing choices, and the factors that mattered.' },
  { n: '03', title: 'Get a verdict and a fix', body: 'A clear viral/ordinary call, ranked improvements, and a rewritten hook and script ready to film.' },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Know why a video went viral — <span className="text-hook">before</span> you post the next one.
              </h1>
              <p className="mt-5 text-lg text-ink-600">
                Paste any YouTube Short, TikTok, or Reel. Hookcast breaks down the hook, script, and editing,
                gives an honest viral-or-ordinary verdict, and rewrites the parts that are holding it back.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button size="lg">Analyze your first video free</Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="ghost">See pricing</Button>
                </Link>
              </div>
              <p className="mt-4 text-xs text-ink-400">No credit card required. 3 free analyses every month.</p>
            </div>
            <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-card">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-400">Most rewatches and shares happen here</p>
              <HookTimeline />
              <p className="mt-4 text-sm text-ink-600">
                Every analysis starts by isolating exactly what happens in the first three seconds —
                the single biggest predictor of whether a short-form video gets watched past the hook.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-ink/10 bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Everything that makes a short-form video work, in one breakdown</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <Card key={f.title}>
                  <CardHeader>
                    <CardTitle>{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-ink-600">{f.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">How it works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <span className="font-mono text-sm text-hook">{s.n}</span>
                <h3 className="mt-2 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-600">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-ink/10 bg-ink py-20 text-paper">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Stop guessing why your last video flopped.</h2>
            <p className="mt-3 text-paper/70">Three free analyses a month, no card required.</p>
            <Link href="/signup" className="mt-6 inline-block">
              <Button size="lg">Get started free</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
