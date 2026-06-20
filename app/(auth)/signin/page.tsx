import Link from 'next/link';
import { Suspense } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-display text-lg font-semibold">
          hook<span className="text-hook">cast</span>
        </Link>
        <h1 className="mb-6 text-center font-display text-xl font-semibold">Sign in</h1>
        <Suspense>
          <SignInForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-ink-400">
          No account? <Link href="/signup" className="font-medium text-hook-dim hover:underline">Sign up free</Link>
        </p>
      </div>
    </main>
  );
}
