import type { Plan } from '@/types';

// Single source of truth for plan limits & pricing copy. Stripe price
// IDs live in env vars so the same code works across Stripe accounts.
export const PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    monthlyAnalyses: 3,
    features: [
      '3 video analyses / month',
      'Virality score & verdict',
      'Hook breakdown',
      '1 hook/script redesign per analysis',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 29,
    monthlyAnalyses: 100,
    features: [
      '100 video analyses / month',
      'Full hook, script & editing breakdown',
      'Unlimited hook/script redesigns',
      'Similar viral video discovery',
      'Priority Claude analysis queue',
    ],
    stripePriceEnvVar: 'NEXT_PUBLIC_STRIPE_PRICE_PRO',
  },
  {
    id: 'AGENCY',
    name: 'Agency',
    price: 99,
    monthlyAnalyses: 500,
    features: [
      '500 video analyses / month',
      'Everything in Pro',
      'Bulk CSV export',
      'Multi-seat ready (see docs)',
      'Email support',
    ],
    stripePriceEnvVar: 'NEXT_PUBLIC_STRIPE_PRICE_AGENCY',
  },
];

export function getPlan(id: string | undefined | null): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}
