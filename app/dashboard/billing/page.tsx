import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getPlan } from '@/lib/plans';
import { getUsageThisMonth } from '@/lib/usage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PricingTable } from '@/components/pricing/PricingTable';
import { ManageBillingButton } from '@/components/pricing/ManageBillingButton';

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/signin');

  const [subscription, used] = await Promise.all([
    db.subscription.findUnique({ where: { userId } }),
    getUsageThisMonth(userId),
  ]);
  const plan = getPlan(subscription?.plan);

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="font-display text-2xl font-semibold">Billing</h1>

      <Card>
        <CardHeader><CardTitle>Current plan</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-ink-600">
            You&apos;re on the <strong>{plan.name}</strong> plan — {used} / {plan.monthlyAnalyses} analyses used this month.
          </p>
          {subscription?.currentPeriodEnd && (
            <p className="mt-1 text-xs text-ink-400">
              {subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
            </p>
          )}
          {subscription?.stripeCustomerId && (
            <div className="mt-4">
              <ManageBillingButton />
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold">Change plan</h2>
        <PricingTable currentPlan={plan.id} />
      </div>
    </div>
  );
}
