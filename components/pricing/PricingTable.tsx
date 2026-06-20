'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PLANS } from '@/lib/plans';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export function PricingTable({ currentPlan }: { currentPlan?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function choose(plan: (typeof PLANS)[number]) {
    if (!session) {
      router.push('/signup');
      return;
    }
    if (plan.id === 'FREE') return;

    // Next.js only statically inlines literal `process.env.NEXT_PUBLIC_X`
    // expressions in client bundles — a computed/bracketed lookup would
    // always be undefined in the browser, so this stays a literal switch.
    const priceId =
      plan.id === 'PRO'
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO
        : plan.id === 'AGENCY'
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY
          : undefined;
    if (!priceId) {
      alert('Stripe price ID is not configured for this plan yet (see .env.local).');
      return;
    }
    setLoadingPlan(plan.id);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {PLANS.map((plan) => (
        <Card key={plan.id} className={plan.id === currentPlan ? 'border-hook ring-1 ring-hook' : undefined}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <p className="mt-2">
              <span className="font-display text-3xl font-semibold">${plan.price}</span>
              <span className="text-sm text-ink-400">/mo</span>
            </p>
          </CardHeader>
          <CardContent>
            <ul className="mb-6 space-y-2 text-sm text-ink-600">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <Button
              variant={plan.id === 'FREE' ? 'ghost' : 'primary'}
              className="w-full"
              disabled={loadingPlan === plan.id || plan.id === currentPlan}
              onClick={() => choose(plan)}
            >
              {plan.id === currentPlan ? 'Current plan' : plan.id === 'FREE' ? 'Start free' : loadingPlan === plan.id ? 'Redirecting…' : `Choose ${plan.name}`}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
