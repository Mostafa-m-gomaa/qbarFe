import {
  LayoutDashboard,
  FolderKanban,
  Target,
  ClipboardList,
  UserRound,
  Building2,
  FileText,
  ShoppingCart,
  Package,
  Tags,
  Ruler,
  SlidersHorizontal,
  Factory,
  Users,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from 'lucide-react';

import { PERMISSIONS, PURCHASED_ORDERS_ACCESS } from './permissions';
import { strings } from './strings';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Permission key(s) required to see this item (ANY-OF). Undefined = always visible. */
  requiredPermission?: string | string[];
  /** When true, the item is a not-yet-implemented placeholder (rendered disabled). */
  comingSoon?: boolean;
}

export interface NavSection {
  id: string;
  /** Optional group heading shown above the section (hidden when the rail is collapsed). */
  label?: string;
  items: NavItem[];
}

/**
 * Sidebar navigation, generated from config and filtered by permissions.
 * Items route to real screens as each Phase 2 checkpoint lands; `comingSoon` marks
 * placeholders so the information architecture is visible without fake pages.
 */
export const navigation: NavSection[] = [
  {
    id: 'overview',
    items: [
      {
        label: strings.nav.dashboard,
        href: '/app/dashboard',
        icon: LayoutDashboard,
        requiredPermission: PERMISSIONS.reports.read,
      },
    ],
  },
  {
    id: 'crm',
    label: strings.nav.crm,
    items: [
      {
        label: strings.nav.projects,
        href: '/app/projects',
        icon: FolderKanban,
        requiredPermission: [PERMISSIONS.projects.read, PERMISSIONS.projects.readAll],
      },
      {
        label: strings.nav.opportunities,
        href: '/app/opportunities',
        icon: Target,
        requiredPermission: [PERMISSIONS.opportunities.read, PERMISSIONS.opportunities.readAll],
      },
      {
        label: strings.nav.activities,
        href: '/app/activities',
        icon: ClipboardList,
        requiredPermission: [
          PERMISSIONS.activities.read,
          PERMISSIONS.activities.readAll,
          PERMISSIONS.followUps.read,
          PERMISSIONS.followUps.readAll,
        ],
      },
      {
        label: strings.nav.consultants,
        href: '/app/consultants',
        icon: UserRound,
        requiredPermission: PERMISSIONS.consultants.read,
      },
      {
        label: strings.nav.contractors,
        href: '/app/contractors',
        icon: Building2,
        requiredPermission: PERMISSIONS.contractors.read,
      },
    ],
  },
  {
    id: 'manufacturing',
    label: strings.nav.manufacturing,
    items: [
      {
        label: strings.nav.manufacturingClearance,
        href: '/app/manufacturing/clearance',
        icon: Factory,
        requiredPermission: [PERMISSIONS.projects.read, PERMISSIONS.projects.readAll],
      },
      {
        label: strings.nav.manufacturingProduction,
        href: '/app/manufacturing/production',
        icon: Factory,
        requiredPermission: [PERMISSIONS.projects.read, PERMISSIONS.projects.readAll],
      },
      {
        label: strings.nav.manufacturingPending,
        href: '/app/manufacturing/pending',
        icon: Factory,
        requiredPermission: PERMISSIONS.projects.readAll,
      },
      {
        label: strings.nav.manufacturingAging,
        href: '/app/manufacturing/aging',
        icon: Factory,
        requiredPermission: PERMISSIONS.projects.readAll,
      },
    ],
  },
  {
    id: 'sales',
    label: strings.nav.sales,
    items: [
      {
        label: strings.nav.quotations,
        href: '/app/quotations',
        icon: FileText,
        requiredPermission: PERMISSIONS.quotations.read,
      },
      {
        label: strings.nav.purchasedOrders,
        href: '/app/purchased-orders',
        icon: ShoppingCart,
        requiredPermission: [...PURCHASED_ORDERS_ACCESS],
      },
    ],
  },
  {
    id: 'catalog',
    label: strings.nav.catalog,
    items: [
      {
        label: strings.nav.products,
        href: '/app/products',
        icon: Package,
        requiredPermission: PERMISSIONS.products.read,
        comingSoon: true,
      },
      {
        label: strings.nav.productCategories,
        href: '/app/product-categories',
        icon: Tags,
        requiredPermission: PERMISSIONS.products.read,
        comingSoon: true,
      },
      {
        label: strings.nav.units,
        href: '/app/units',
        icon: Ruler,
        requiredPermission: PERMISSIONS.products.read,
        comingSoon: true,
      },
    ],
  },
  {
    id: 'pricing',
    label: strings.nav.pricing,
    items: [
      {
        label: strings.nav.quotationSchedule,
        href: '/app/quotation-schedule',
        icon: SlidersHorizontal,
        requiredPermission: PERMISSIONS.quotations.manageSchedule,
        comingSoon: true,
      },
    ],
  },
  {
    id: 'administration',
    label: strings.nav.administration,
    items: [
      {
        label: strings.nav.users,
        href: '/app/users',
        icon: Users,
        requiredPermission: PERMISSIONS.users.read,
      },
      {
        label: strings.nav.roles,
        href: '/app/roles',
        icon: ShieldCheck,
        requiredPermission: PERMISSIONS.roles.read,
      },
      {
        label: strings.nav.settings,
        href: '/app/settings',
        icon: Settings,
      },
    ],
  },
];
