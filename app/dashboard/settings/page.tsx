import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/signin');

  const user = await db.user.findUnique({ where: { id: userId } });

  return (
    <div className="max-w-md space-y-6">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-ink-400">Name</p>
            <p className="text-ink-600">{user?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-ink-400">Email</p>
            <p className="text-ink-600">{user?.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-ink-400">Member since</p>
            <p className="text-ink-600">{user?.createdAt.toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-ink-400">
        Profile editing and password changes are not wired up in this scaffold yet — see docs/PRD.md, “Out of scope for v1.”
      </p>
    </div>
  );
}
