import Link from 'next/link';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-display text-lg font-semibold">
          hook<span className="text-hook">cast</span>
        </Link>
        <h1 className="mb-6 text-center font-display text-xl font-semibold">Create your free account</h1>
        <SignUpForm />
        <p className="mt-6 text-center text-sm text-ink-400">
          Already have an account? <Link href="/signin" className="font-medium text-hook-dim hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
