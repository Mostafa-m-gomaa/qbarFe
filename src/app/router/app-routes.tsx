import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/app/layouts/app-shell';
import { ProtectedRoute, RequirePermission } from '@/app/router/protected-route';
import { NotFound } from '@/components/feedback/status-views';
import { PageSkeleton } from '@/components/feedback/skeletons';
import { PERMISSIONS, PURCHASED_ORDERS_ACCESS } from '@/constants/permissions';
import { useAuthStore } from '@/stores/auth/auth.store';

// Route-level code splitting keeps the login path light and isolates heavy deps
// (e.g. charts) into the dashboard chunk.
const LoginPage = lazy(() =>
  import('@/features/auth/login-page').then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/dashboard-page').then((m) => ({ default: m.DashboardPage })),
);
const UsersPage = lazy(() =>
  import('@/features/users/users-page').then((m) => ({ default: m.UsersPage })),
);
const ConsultantsPage = lazy(() =>
  import('@/features/consultants/consultants-page').then((m) => ({ default: m.ConsultantsPage })),
);
const ContractorsPage = lazy(() =>
  import('@/features/contractors/contractors-page').then((m) => ({ default: m.ContractorsPage })),
);
const ProjectsPage = lazy(() =>
  import('@/features/projects/projects-page').then((m) => ({ default: m.ProjectsPage })),
);
const ProjectDetailPage = lazy(() =>
  import('@/features/projects/project-detail-page').then((m) => ({ default: m.ProjectDetailPage })),
);
const ProjectFormPage = lazy(() =>
  import('@/features/projects/project-form-page').then((m) => ({ default: m.ProjectFormPage })),
);
const OpportunitiesPage = lazy(() =>
  import('@/features/opportunities/opportunities-page').then((m) => ({
    default: m.OpportunitiesPage,
  })),
);
const OpportunityDetailPage = lazy(() =>
  import('@/features/opportunities/opportunity-detail-page').then((m) => ({
    default: m.OpportunityDetailPage,
  })),
);
const ActivitiesPage = lazy(() =>
  import('@/features/activities/activities-page').then((m) => ({ default: m.ActivitiesPage })),
);
const RolesPage = lazy(() =>
  import('@/features/roles/roles-page').then((m) => ({ default: m.RolesPage })),
);
const SettingsPage = lazy(() =>
  import('@/features/settings/settings-page').then((m) => ({ default: m.SettingsPage })),
);
const ClearancePage = lazy(() =>
  import('@/features/manufacturing/clearance-page').then((m) => ({ default: m.ClearancePage })),
);
const ProductionPage = lazy(() =>
  import('@/features/manufacturing/production-page').then((m) => ({ default: m.ProductionPage })),
);
const PendingManufacturingPage = lazy(() =>
  import('@/features/manufacturing/pending-page').then((m) => ({
    default: m.PendingPage,
  })),
);
const AgingManufacturingPage = lazy(() =>
  import('@/features/manufacturing/aging-page').then((m) => ({ default: m.AgingPage })),
);
const QuotationsPage = lazy(() =>
  import('@/features/quotations/quotations-page').then((m) => ({ default: m.QuotationsPage })),
);
const QuotationBuilderPage = lazy(() =>
  import('@/features/quotations/quotation-builder-page').then((m) => ({
    default: m.QuotationBuilderPage,
  })),
);
const PurchasedOrdersPage = lazy(() =>
  import('@/features/purchased-orders/purchased-orders-page').then((m) => ({
    default: m.PurchasedOrdersPage,
  })),
);
const PurchasedOrderDetailPage = lazy(() =>
  import('@/features/purchased-orders/purchased-order-detail-page').then((m) => ({
    default: m.PurchasedOrderDetailPage,
  })),
);

/** Redirects already-authenticated users away from /login. */
function LoginRoute() {
  const status = useAuthStore((state) => state.status);
  if (status === 'authenticated') {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <LoginPage />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <RequirePermission permission={PERMISSIONS.reports.read}>
                  <DashboardPage />
                </RequirePermission>
              }
            />
            <Route
              path="users"
              element={
                <RequirePermission permission={PERMISSIONS.users.read}>
                  <UsersPage />
                </RequirePermission>
              }
            />
            <Route
              path="projects"
              element={
                <RequirePermission
                  permission={[PERMISSIONS.projects.read, PERMISSIONS.projects.readAll]}
                >
                  <ProjectsPage />
                </RequirePermission>
              }
            />
            <Route
              path="projects/new"
              element={
                <RequirePermission permission={PERMISSIONS.projects.create}>
                  <ProjectFormPage />
                </RequirePermission>
              }
            />
            <Route
              path="projects/:id/edit"
              element={
                <RequirePermission permission={PERMISSIONS.projects.update}>
                  <ProjectFormPage />
                </RequirePermission>
              }
            />
            <Route
              path="projects/:id"
              element={
                <RequirePermission
                  permission={[PERMISSIONS.projects.read, PERMISSIONS.projects.readAll]}
                >
                  <ProjectDetailPage />
                </RequirePermission>
              }
            />
            <Route
              path="opportunities"
              element={
                <RequirePermission
                  permission={[PERMISSIONS.opportunities.read, PERMISSIONS.opportunities.readAll]}
                >
                  <OpportunitiesPage />
                </RequirePermission>
              }
            />
            <Route
              path="opportunities/:id"
              element={
                <RequirePermission
                  permission={[PERMISSIONS.opportunities.read, PERMISSIONS.opportunities.readAll]}
                >
                  <OpportunityDetailPage />
                </RequirePermission>
              }
            />
            <Route
              path="activities"
              element={
                <RequirePermission
                  permission={[
                    PERMISSIONS.activities.read,
                    PERMISSIONS.activities.readAll,
                    PERMISSIONS.followUps.read,
                    PERMISSIONS.followUps.readAll,
                  ]}
                >
                  <ActivitiesPage />
                </RequirePermission>
              }
            />
            <Route
              path="consultants"
              element={
                <RequirePermission permission={PERMISSIONS.consultants.read}>
                  <ConsultantsPage />
                </RequirePermission>
              }
            />
            <Route
              path="contractors"
              element={
                <RequirePermission permission={PERMISSIONS.contractors.read}>
                  <ContractorsPage />
                </RequirePermission>
              }
            />
            <Route
              path="quotations"
              element={
                <RequirePermission
                  permission={[PERMISSIONS.quotations.read, PERMISSIONS.quotations.readAll]}
                >
                  <QuotationsPage />
                </RequirePermission>
              }
            />
            <Route
              path="quotations/:id"
              element={
                <RequirePermission
                  permission={[PERMISSIONS.quotations.read, PERMISSIONS.quotations.readAll]}
                >
                  <QuotationBuilderPage />
                </RequirePermission>
              }
            />
            <Route path="purchase-orders" element={<Navigate to="/app/purchased-orders" replace />} />
            <Route
              path="purchased-orders"
              element={
                <RequirePermission permission={[...PURCHASED_ORDERS_ACCESS]}>
                  <PurchasedOrdersPage />
                </RequirePermission>
              }
            />
            <Route
              path="purchased-orders/:id"
              element={
                <RequirePermission permission={[...PURCHASED_ORDERS_ACCESS]}>
                  <PurchasedOrderDetailPage />
                </RequirePermission>
              }
            />
            <Route
              path="manufacturing/clearance"
              element={
                <RequirePermission
                  permission={[PERMISSIONS.projects.read, PERMISSIONS.projects.readAll]}
                >
                  <ClearancePage />
                </RequirePermission>
              }
            />
            <Route
              path="manufacturing/production"
              element={
                <RequirePermission
                  permission={[PERMISSIONS.projects.read, PERMISSIONS.projects.readAll]}
                >
                  <ProductionPage />
                </RequirePermission>
              }
            />
            <Route
              path="manufacturing/pending"
              element={
                <RequirePermission permission={PERMISSIONS.projects.readAll}>
                  <PendingManufacturingPage />
                </RequirePermission>
              }
            />
            <Route
              path="manufacturing/aging"
              element={
                <RequirePermission permission={PERMISSIONS.projects.readAll}>
                  <AgingManufacturingPage />
                </RequirePermission>
              }
            />
            <Route
              path="roles"
              element={
                <RequirePermission permission={PERMISSIONS.roles.read}>
                  <RolesPage />
                </RequirePermission>
              }
            />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function RouteFallback() {
  return (
    <div className="p-8">
      <PageSkeleton />
    </div>
  );
}
