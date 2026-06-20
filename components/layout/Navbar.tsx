import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b border-ink/10 bg-paper/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          hook<span className="text-hook">cast</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink-600 md:flex">
          <Link href="/pricing" className="hover:text-ink">Pricing</Link>
          <Link href="/#how-it-works" className="hover:text-ink">How it works</Link>
        </nav>
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/signin" className="text-sm text-ink-600 hover:text-ink">Sign in</Link>
              <Link href="/signup">
                <Button size="sm">Get started free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
