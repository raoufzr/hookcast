import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PricingTable } from '@/components/pricing/PricingTable';

export default async function PricingPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const subscription = userId ? await db.subscription.findUnique({ where: { userId } }) : null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Simple, usage-based pricing</h1>
          <p className="mt-2 text-ink-600">Every plan includes the full breakdown — hook, script, editing, and redesigns.</p>
        </div>
        <PricingTable currentPlan={subscription?.plan ?? 'FREE'} />
      </main>
      <Footer />
    </>
  );
}
