import { useEffect, useRef, type ReactNode } from 'react';

import { BrandMark } from '@/components/navigation/brand-mark';
import { strings } from '@/constants/strings';
import { useAuthStore } from '@/stores/auth/auth.store';

/**
 * Blocks rendering of the app until the initial session-recovery attempt
 * (refresh → me) settles, preventing any flash of protected/login UI.
 */
export function AuthBootstrapGate({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      void bootstrap();
    }
  }, [bootstrap]);

  if (status === 'idle' || status === 'bootstrapping') {
    return <BootSplash />;
  }

  return <>{children}</>;
}

function BootSplash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <BrandMark className="h-11 animate-pulse" />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="size-2 animate-ping rounded-full bg-primary" aria-hidden />
        {strings.auth.bootstrapping}
      </div>
    </div>
  );
}
