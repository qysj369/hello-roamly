import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import QueryDevtoolsPanel from '@/components/dev/QueryDevtoolsPanel';
import { queryClient } from '@/lib/query/client';

type AppProvidersProps = {
  children: ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <QueryDevtoolsPanel />
    </QueryClientProvider>
  );
}
