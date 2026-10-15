import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

import { queryClient } from './query-client';

/** Composes global providers: server-state, routing, tooltips, and the toast surface. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
