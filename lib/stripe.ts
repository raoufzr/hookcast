import Stripe from 'stripe';

// Lazily constructed so the app boots even without a key set (e.g.
// during local UI work before Stripe is wired up); routes that need
// it will throw a clear error instead of failing at import time.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set. Add it to .env.local to enable billing.');
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  }
  return _stripe;
}
