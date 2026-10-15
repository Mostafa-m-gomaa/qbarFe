import { ChartNoAxesColumnIncreasing, Clock3, Cog, ListChecks } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { strings } from '@/constants/strings';
import { cn } from '@/lib/cn';

const links = [
  {
    to: '/app/manufacturing/clearance',
    label: strings.nav.manufacturingClearance,
    icon: ListChecks,
  },
  {
    to: '/app/manufacturing/production',
    label: strings.nav.manufacturingProduction,
    icon: Cog,
  },
  {
    to: '/app/manufacturing/pending',
    label: strings.nav.manufacturingPending,
    icon: Clock3,
  },
  {
    to: '/app/manufacturing/aging',
    label: strings.nav.manufacturingAging,
    icon: ChartNoAxesColumnIncreasing,
  },
] as const;

export function ManufacturingSubNav() {
  return (
    <nav
      aria-label={strings.nav.manufacturing}
      className="grid grid-cols-2 gap-2 rounded-2xl border border-border/70 bg-card/80 p-2 shadow-sm backdrop-blur sm:grid-cols-4"
    >
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => {
            return cn(
              'group relative flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-xl border px-3 py-2 text-sm font-semibold',
              'transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:origin-center after:rounded-full after:bg-primary after:transition-transform after:duration-300',
              isActive
                ? 'animate-in fade-in-50 zoom-in-95 border-primary/30 bg-primary/10 text-primary shadow-md shadow-primary/10 after:scale-x-100'
                : 'border-transparent text-muted-foreground after:scale-x-0 hover:-translate-y-0.5 hover:border-border hover:bg-muted/70 hover:text-foreground hover:shadow-sm',
            );
          }}
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-lg transition-all duration-300',
                  isActive
                    ? 'rotate-3 scale-110 bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground group-hover:rotate-3 group-hover:scale-105 group-hover:text-foreground',
                )}
              >
                <Icon className={cn('size-4', isActive && 'animate-pulse')} />
              </span>
              <span>{label}</span>
              {isActive && (
                <span
                  aria-hidden
                  className="absolute end-2 top-2 size-1.5 animate-ping rounded-full bg-primary"
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
