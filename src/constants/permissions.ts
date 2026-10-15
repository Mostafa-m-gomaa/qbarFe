/**
 * Canonical permission keys used for UI gating.
 * Exact strings from the backend permissions catalog (casing matters).
 * Frontend gating is UX only — the backend remains the security authority.
 */
export const PERMISSIONS = {
  users: {
    read: 'users.read',
    create: 'users.create',
    update: 'users.update',
    activate: 'users.activate',
    deactivate: 'users.deactivate',
  },
  roles: {
    read: 'roles.read',
    create: 'roles.create',
    update: 'roles.update',
  },
  permissions: {
    read: 'permissions.read',
  },
  currencies: {
    read: 'currencies.read',
    manage: 'currencies.manage',
  },
  fx: {
    read: 'fx.read',
    manage: 'fx.manage',
  },
  consultants: {
    read: 'consultants.read',
    create: 'consultants.create',
    update: 'consultants.update',
    activate: 'consultants.activate',
    deactivate: 'consultants.deactivate',
    archive: 'consultants.archive',
  },
  contractors: {
    read: 'contractors.read',
    create: 'contractors.create',
    update: 'contractors.update',
    activate: 'contractors.activate',
    deactivate: 'contractors.deactivate',
    archive: 'contractors.archive',
  },
  projects: {
    read: 'projects.read',
    readAll: 'projects.read_all',
    create: 'projects.create',
    update: 'projects.update',
    stage: 'projects.stage',
    closeTender: 'projects.close_tender',
    archive: 'projects.archive',
    close: 'projects.close',
    reopen: 'projects.reopen',
  },
  opportunities: {
    read: 'opportunities.read',
    readAll: 'opportunities.read_all',
    create: 'opportunities.create',
    update: 'opportunities.update',
    stage: 'opportunities.stage',
    archive: 'opportunities.archive',
  },
  activities: {
    read: 'activities.read',
    readAll: 'activities.read_all',
    create: 'activities.create',
    update: 'activities.update',
    complete: 'activities.complete',
    archive: 'activities.archive',
  },
  followUps: {
    read: 'followups.read',
    readAll: 'followups.read_all',
    create: 'followups.create',
    update: 'followups.update',
    complete: 'followups.complete',
    cancel: 'followups.cancel',
  },
  products: {
    read: 'products.read',
    create: 'products.create',
    update: 'products.update',
    activate: 'products.activate',
    deactivate: 'products.deactivate',
    archive: 'products.archive',
  },
  pricing: {
    read: 'pricing.read',
    manage: 'pricing.manage',
  },
  quotations: {
    read: 'quotations.read',
    readAll: 'quotations.read_all',
    create: 'quotations.create',
    update: 'quotations.update',
    issue: 'quotations.issue',
    revise: 'quotations.revise',
    archive: 'quotations.archive',
    viewCost: 'quotations.view_cost',
    overrideBelowCost: 'quotations.override_below_cost',
    manageSchedule: 'quotations.manage_schedule',
    commercialWon: 'quotations.commercial_won',
  },
  purchasedOrders: {
    read: 'purchased_orders.read',
    readAll: 'purchased_orders.read_all',
  },
  purchaseOrders: {
    read: 'purchase_orders.read',
    readAll: 'purchase_orders.read_all',
    create: 'purchase_orders.create',
    update: 'purchase_orders.update',
    cancel: 'purchase_orders.cancel',
    archive: 'purchase_orders.archive',
  },
  reports: {
    read: 'reports.read',
    readAll: 'reports.read_all',
    export: 'reports.export',
  },
  audit: {
    read: 'audit.read',
  },
} as const;

/**
 * Route/nav visibility for purchased-order snapshots (ANY-OF).
 * Backend still requires `purchased_orders.read` / `read_all` for the API; quotation
 * keys keep the screen reachable for roles not yet updated with the new permissions.
 */
export const PURCHASED_ORDERS_ACCESS = [
  PERMISSIONS.purchasedOrders.read,
  PERMISSIONS.purchasedOrders.readAll,
  PERMISSIONS.quotations.read,
  PERMISSIONS.quotations.readAll,
] as const;

/**
 * UX gate for changing quotation commercial status (list actions, builder control).
 * Backend requires `quotations.commercial_won`; other quotation write perms are included
 * so sales roles see actions until roles are updated on the server.
 */
export const QUOTATION_COMMERCIAL_STATUS_ACCESS = [
  PERMISSIONS.quotations.commercialWon,
  PERMISSIONS.quotations.update,
  PERMISSIONS.quotations.issue,
  PERMISSIONS.quotations.revise,
] as const;
