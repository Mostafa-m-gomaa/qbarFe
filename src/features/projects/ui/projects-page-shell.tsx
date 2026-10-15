import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface ProjectsPageShellProps {
  children: ReactNode;
  className?: string;
  maxWidth?: '5xl' | '6xl' | '7xl' | 'full';
}

const maxWidthClass = {
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export function ProjectsPageShell({
  children,
  className,
  maxWidth = '7xl',
}: ProjectsPageShellProps) {
  return (
    <div className={cn('projects-surface projects-dot-grid -mx-4 -mt-2 min-h-full px-4 pb-24 pt-2 sm:-mx-6 sm:px-6', className)}>
      <div className={cn('mx-auto w-full space-y-6', maxWidthClass[maxWidth])}>{children}</div>
    </div>
  );
}
