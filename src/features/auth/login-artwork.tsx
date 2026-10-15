import { Activity, LineChart, ShieldCheck } from 'lucide-react';

import { BrandMark } from '@/components/navigation/brand-mark';
import { strings } from '@/constants/strings';

/**
 * Decorative brand panel for the login screen. Uses a restrained industrial/electrical
 * busbar motif (conductor lines) rather than a literal illustration.
 */
export function LoginArtwork() {
  return (
    <div className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Subtle busbar/conductor lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
        aria-hidden
        preserveAspectRatio="none"
        viewBox="0 0 400 400"
      >
        <g stroke="currentColor" strokeWidth="1.5" fill="none">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1="0" y1={40 + i * 42} x2="400" y2={40 + i * 42} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <circle key={i} cx={60 + i * 60} cy={40 + ((i * 3) % 9) * 42} r="4" fill="currentColor" />
          ))}
        </g>
      </svg>

      <div className="relative">
        <BrandMark className="h-9" />
      </div>

      <div className="relative space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold leading-snug">{strings.auth.welcome}</h2>
          <p className="max-w-md text-sidebar-foreground/70">{strings.app.tagline}</p>
        </div>
        <ul className="space-y-4 text-sm text-sidebar-foreground/80">
          <Feature icon={<LineChart className="size-5" />} text={strings.auth.features.pipeline} />
          <Feature icon={<Activity className="size-5" />} text={strings.auth.features.activity} />
          <Feature icon={<ShieldCheck className="size-5" />} text={strings.auth.features.security} />
        </ul>
      </div>

      <div className="relative text-xs text-sidebar-foreground/50">
        © {new Date().getFullYear()} {strings.app.name}
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-foreground/10 text-sidebar-accent">
        {icon}
      </span>
      {text}
    </li>
  );
}
