import { Menu } from 'lucide-react';
import { useState } from 'react';

import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { BrandMark } from '@/components/navigation/brand-mark';
import { SidebarNav } from '@/components/navigation/sidebar-nav';
import { UserMenu } from '@/components/navigation/user-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

/** Top bar: mobile menu trigger, breadcrumbs, and the user menu. */
export function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6">
      {/* Mobile navigation drawer (opens from the start/right edge in RTL). */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground"
        >
          <div className="flex h-16 items-center border-b border-sidebar-border px-4">
            <SheetTitle asChild>
              <BrandMark className="h-8" />
            </SheetTitle>
          </div>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <Breadcrumbs />

      <div className="ms-auto flex items-center gap-2">
        <UserMenu />
      </div>
    </header>
  );
}
