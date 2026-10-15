import { ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { navigation } from '@/constants/navigation';
import { strings } from '@/constants/strings';

/** Flat href → label lookup built from the navigation config. */
const labelByHref = new Map<string, string>(
  navigation.flatMap((section) => section.items.map((item) => [item.href, item.label])),
);

/** Simple two-level breadcrumb: app root → current section. */
export function Breadcrumbs() {
  const { pathname } = useLocation();
  const match = [...labelByHref.keys()].find((href) => pathname.startsWith(href));
  const current = match ? labelByHref.get(match) : undefined;

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm">
      <span className="text-muted-foreground">{strings.app.name}</span>
      {current && (
        <>
          <ChevronRight className="size-4 text-muted-foreground/60" aria-hidden />
          <span className="font-medium text-foreground">{current}</span>
        </>
      )}
    </nav>
  );
}
