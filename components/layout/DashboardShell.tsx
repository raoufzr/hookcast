'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Analyses' },
  { href: '/dashboard/billing', label: 'Billing' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl">
      <aside className="hidden w-56 shrink-0 border-r border-ink/10 px-4 py-8 sm:block">
        <nav className="space-y-1">
          {NAV.map((item) => {
            const active = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm font-medium',
                  active ? 'bg-ink text-paper' : 'text-ink-600 hover:bg-ink/5'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="mt-8 block w-full rounded-md px-3 py-2 text-left text-sm text-ink-400 hover:bg-ink/5 hover:text-ink"
        >
          Sign out
        </button>
      </aside>
      <main className="min-w-0 flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
