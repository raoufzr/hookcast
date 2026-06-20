import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { PLANS } from '@/lib/plans';

export const dynamic = 'force-dynamic';

function planIdForPrice(priceId: string | undefined): 'FREE' | 'PRO' | 'AGENCY' {
  if (!priceId) return 'FREE';
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO) return 'PRO';
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY) return 'AGENCY';
  return PLANS.find((p) => p.stripePriceEnvVar && process.env[p.stripePriceEnvVar] === priceId)?.id ?? 'FREE';
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const signature = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await db.subscription.upsert({
          where: { userId },
          create: {
            userId,
            plan: planIdForPrice(sub.items.data[0]?.price.id),
            status: 'ACTIVE',
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
          update: {
            plan: planIdForPrice(sub.items.data[0]?.price.id),
            status: 'ACTIVE',
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await db.subscription.findUnique({ where: { stripeSubscriptionId: sub.id } });
      if (existing) {
        await db.subscription.update({
          where: { userId: existing.userId },
          data: {
            plan: event.type === 'customer.subscription.deleted' ? 'FREE' : planIdForPrice(sub.items.data[0]?.price.id),
            status: sub.status === 'active' ? 'ACTIVE' : sub.status === 'trialing' ? 'TRIALING' : sub.status === 'past_due' ? 'PAST_DUE' : sub.status === 'canceled' ? 'CANCELED' : 'INCOMPLETE',
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
