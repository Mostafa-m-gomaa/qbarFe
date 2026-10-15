import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { BrandMark } from '@/components/navigation/brand-mark';
import { SidebarNav } from '@/components/navigation/sidebar-nav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/stores/ui/ui.store';

/** Desktop sidebar rail with a collapse toggle. Hidden on small screens. */
export function AppSidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggle = useUiStore((state) => state.toggleSidebar);

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[76px]' : 'w-64',
      )}
    >
      <div
        className={cn(
          'flex h-16 items-center border-b border-sidebar-border px-4',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {collapsed ? <BrandMark className="h-8" showText={false} /> : <BrandMark className="h-8" />}
      </div>

      <SidebarNav collapsed={collapsed} />

      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          onClick={toggle}
          className="w-full text-sidebar-foreground/80 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <>
              <PanelLeftClose className="size-5" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
