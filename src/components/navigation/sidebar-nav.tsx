import { NavLink } from 'react-router-dom';

import { navigation, type NavItem } from '@/constants/navigation';
import { strings } from '@/constants/strings';
import { cn } from '@/lib/cn';
import { hasAnyPermission, hasPermission } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth/auth.store';

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

/** Renders permission-filtered navigation. Shared by the desktop rail and mobile drawer. */
export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const permissions = useAuthStore((state) => state.permissions);

  const isVisible = (item: NavItem) => {
    if (!item.requiredPermission) return true;
    return Array.isArray(item.requiredPermission)
      ? hasAnyPermission(permissions, item.requiredPermission)
      : hasPermission(permissions, item.requiredPermission);
  };

  return (
    <nav className="flex flex-1 flex-col gap-6 px-3 py-4">
      {navigation.map((section) => {
        const items = section.items.filter(isVisible);
        if (items.length === 0) return null;
        return (
          <div key={section.id} className="space-y-1">
            {section.label && !collapsed && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/40">
                {section.label}
              </p>
            )}
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.href}>
                  <SidebarNavLink item={item} collapsed={collapsed} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function SidebarNavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  if (item.comingSoon) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/45',
          collapsed && 'justify-center',
        )}
        title={collapsed ? item.label : undefined}
        aria-disabled
      >
        <Icon className="size-5 shrink-0" />
        {!collapsed && (
          <span className="flex flex-1 items-center justify-between gap-2">
            {item.label}
            <span className="rounded bg-sidebar-foreground/10 px-1.5 py-0.5 text-[10px] font-medium">
              {strings.common.comingSoon}
            </span>
          </span>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'text-sidebar-foreground/80 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent',
          isActive &&
          'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          collapsed && 'justify-center',
        )
      }
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}
