import * as React from 'react';

import { cn } from '@/lib/cn';

/**
 * Native date input wrapper (RHF-compatible via forwardRef).
 * Values are `YYYY-MM-DD` strings; the backend coerces them to dates.
 */
export const DateField = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="date"
    className={cn(
      'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'aria-[invalid=true]:border-destructive',
      className,
    )}
    {...props}
  />
));
DateField.displayName = 'DateField';
