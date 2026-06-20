'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  }

  return (
    <Button variant="ghost" onClick={open} disabled={loading}>
      {loading ? 'Opening…' : 'Manage billing in Stripe'}
    </Button>
  );
}
