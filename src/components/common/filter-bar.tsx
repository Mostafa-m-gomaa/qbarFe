import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/** Layout wrapper for list filter controls (presentation only — not a data engine). */
export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>{children}</div>
  );
}
