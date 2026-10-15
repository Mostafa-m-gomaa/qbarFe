/** Centralized, stable TanStack Query keys. */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  dashboard: ['dashboard'] as const,
  users: {
    all: ['users'] as const,
    list: (filters?: object) => (filters ? (['users', filters] as const) : (['users'] as const)),
    detail: (id: string) => ['user', id] as const,
  },
  roles: {
    all: ['roles'] as const,
  },
  currencies: {
    all: ['currencies'] as const,
  },
  consultants: {
    all: ['consultants'] as const,
    list: (filters?: object) => ['consultants', filters ?? {}] as const,
    detail: (id: string) => ['consultant', id] as const,
  },
  contractors: {
    all: ['contractors'] as const,
    list: (filters?: object) => ['contractors', filters ?? {}] as const,
    detail: (id: string) => ['contractor', id] as const,
  },
  projects: {
    all: ['projects'] as const,
    list: (filters?: object) => ['projects', filters ?? {}] as const,
    detail: (id: string) => ['project', id] as const,
    opportunities: (id: string) => ['project-opportunities', id] as const,
    activities: (id: string) => ['project-activities', id] as const,
  },
  opportunities: {
    all: ['opportunities'] as const,
    list: (filters?: object) => ['opportunities', filters ?? {}] as const,
    detail: (id: string) => ['opportunity', id] as const,
  },
  activities: {
    all: ['activities'] as const,
    list: (filters?: object) => ['activities', filters ?? {}] as const,
    detail: (id: string) => ['activity', id] as const,
  },
  followUps: {
    all: ['follow-ups'] as const,
    list: (filters?: object) => ['follow-ups', filters ?? {}] as const,
    detail: (id: string) => ['follow-up', id] as const,
  },
  products: {
    all: ['products'] as const,
    list: (filters?: object) => ['products', filters ?? {}] as const,
    detail: (id: string) => ['product', id] as const,
    prices: (id: string, filters?: object) => ['product-prices', id, filters ?? {}] as const,
  },
  productCategories: {
    all: ['product-categories'] as const,
    list: (filters?: object) => ['product-categories', filters ?? {}] as const,
  },
  units: {
    all: ['units'] as const,
    list: (filters?: object) => ['units', filters ?? {}] as const,
  },
  quotationSchedule: ['quotation-schedule'] as const,
  quotations: {
    all: ['quotations'] as const,
    list: (filters?: object) => ['quotations', filters ?? {}] as const,
    detail: (id: string) => ['quotation', id] as const,
    revisions: (id: string) => ['quotation-revisions', id] as const,
  },
  purchaseOrders: {
    all: ['purchase-orders'] as const,
    list: (filters?: object) => ['purchase-orders', filters ?? {}] as const,
    detail: (id: string) => ['purchase-order', id] as const,
    revisions: (id: string) => ['purchase-order-revisions', id] as const,
  },
  purchasedOrders: {
    all: ['purchased-orders'] as const,
    list: (filters?: object) => ['purchased-orders', filters ?? {}] as const,
    detail: (id: string) => ['purchased-order', id] as const,
    byQuotation: (quotationId: string) => ['purchased-order-by-quotation', quotationId] as const,
  },
  manufacturing: {
    all: ['manufacturing'] as const,
    clearancePortfolio: ['manufacturing', 'clearance', 'portfolio'] as const,
    productionPortfolio: ['manufacturing', 'production', 'portfolio'] as const,
    projectItems: (projectId: string) => ['manufacturing', 'items', projectId] as const,
    clearances: (projectId: string) => ['manufacturing', 'clearances', projectId] as const,
    pendingPortfolio: ['manufacturing', 'pending', 'portfolio'] as const,
    pendingProject: (projectId: string) => ['manufacturing', 'pending', projectId] as const,
    summary: (projectId: string) => ['manufacturing', 'summary', projectId] as const,
  },
} as const;
