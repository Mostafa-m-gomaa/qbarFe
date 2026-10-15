import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/cn';

interface ProjectDetailSectionProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ProjectDetailSection({
  icon: Icon,
  title,
  description,
  children,
  className,
}: ProjectDetailSectionProps) {
  return (
    <Card
      className={cn(
        'border-border/60 bg-card/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm',
        className,
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" aria-hidden />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
