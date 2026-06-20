import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-md border border-ink/15 bg-white px-3 text-sm text-ink placeholder:text-ink-200 focus:outline-none focus:ring-2 focus:ring-hook/40',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
