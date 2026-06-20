import { db } from '@/lib/db';
import { getPlan } from '@/lib/plans';

/** Start of the current calendar month, used as the usage window. */
function monthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getUsageThisMonth(userId: string): Promise<number> {
  return db.usageLog.count({
    where: { userId, action: 'analyze', createdAt: { gte: monthStart() } },
  });
}

export async function assertUnderQuota(userId: string): Promise<void> {
  const subscription = await db.subscription.findUnique({ where: { userId } });
  const plan = getPlan(subscription?.plan);
  const used = await getUsageThisMonth(userId);
  if (used >= plan.monthlyAnalyses) {
    throw new QuotaExceededError(plan.name, plan.monthlyAnalyses);
  }
}

export async function logUsage(userId: string, action: 'analyze' | 'regenerate' | 'similar'): Promise<void> {
  await db.usageLog.create({ data: { userId, action } });
}

export class QuotaExceededError extends Error {
  constructor(public planName: string, public limit: number) {
    super(`You've used all ${limit} analyses included in the ${planName} plan this month.`);
    this.name = 'QuotaExceededError';
  }
}
