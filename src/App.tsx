import { AppProviders } from '@/app/providers/app-providers';
import { AuthBootstrapGate } from '@/app/providers/auth-bootstrap-gate';
import { AppRoutes } from '@/app/router/app-routes';

export default function App() {
  return (
    <AppProviders>
      <AuthBootstrapGate>
        <AppRoutes />
      </AuthBootstrapGate>
    </AppProviders>
  );
}
