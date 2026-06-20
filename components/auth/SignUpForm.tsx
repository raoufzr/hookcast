'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Could not create your account.');
      setLoading(false);
      return;
    }

    const signInRes = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (signInRes?.error) {
      router.push('/signin');
      return;
    }
    router.push('/dashboard');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input placeholder="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
      <Input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" placeholder="Password (min 8 characters)" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-sm text-hook-dim">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account…' : 'Create free account'}
      </Button>
    </form>
  );
}
