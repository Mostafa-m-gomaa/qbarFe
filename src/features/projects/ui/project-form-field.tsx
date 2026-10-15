import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/cn';

interface ProjectFormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function ProjectFormField({
  label,
  htmlFor,
  error,
  className,
  children,
}: ProjectFormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
