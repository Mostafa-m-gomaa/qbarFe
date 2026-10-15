import { Ban, FileQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { strings } from '@/constants/strings';

/** Full-panel "no permission" view for gated routes. */
export function PermissionDenied() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Ban className="size-7" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{strings.errors.permissionDenied}</h2>
        <p className="text-sm text-muted-foreground">{strings.errors.permissionDeniedHint}</p>
      </div>
      <Button asChild variant="outline">
        <Link to="/app/dashboard">{strings.nav.dashboard}</Link>
      </Button>
    </div>
  );
}

/** Full-page 404 view. */
export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileQuestion className="size-7" />
      </div>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">404</h2>
        <p className="text-sm text-muted-foreground">{strings.errors.notFound}</p>
      </div>
      <Button asChild>
        <Link to="/app/dashboard">{strings.nav.dashboard}</Link>
      </Button>
    </div>
  );
}
