import type { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { strings } from '@/constants/strings';

export interface ProjectSectionNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface ProjectSectionNavProps {
  items: ProjectSectionNavItem[];
  className?: string;
}

export function ProjectSectionNav({ items, className }: ProjectSectionNavProps) {
  return (
    <Card
      className={cn(
        'border-border/60 bg-card/80 shadow-sm ring-1 ring-border/40 backdrop-blur-sm lg:sticky lg:top-20',
        className,
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-tight">
          {strings.projects.formNavTitle}
        </CardTitle>
        <CardDescription className="text-xs">{strings.projects.formNavHint}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
            {label}
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
