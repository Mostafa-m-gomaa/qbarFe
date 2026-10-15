import { cn } from '@/lib/cn';
import { strings } from '@/constants/strings';

/** Q-Bar wordmark + logo glyph. */
export function BrandMark({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 32 32" className="h-full w-auto shrink-0" aria-hidden>
        <rect width="32" height="32" rx="7" className="fill-primary" />
        <path d="M9 8h4v16H9zM15 8h4v10h-4zM21 8h4v16h-4z" className="fill-white" />
        <circle cx="17" cy="22" r="2.5" className="fill-accent" />
      </svg>
      {showText && (
        <span className="text-lg font-extrabold tracking-tight text-current">
          {strings.app.name}
        </span>
      )}
    </div>
  );
}
