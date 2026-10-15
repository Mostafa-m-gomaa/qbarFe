import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface ProjectStickyActionsProps {
  children: ReactNode;
  className?: string;
}

export function ProjectStickyActions({ children, className }: ProjectStickyActionsProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/70',
        className,
      )}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
