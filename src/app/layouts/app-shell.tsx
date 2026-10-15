import { Outlet } from 'react-router-dom';

import { AppHeader } from '@/components/navigation/app-header';
import { AppSidebar } from '@/components/navigation/app-sidebar';

/** Authenticated application shell: sidebar + header + scrollable content region. */
export function AppShell() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
