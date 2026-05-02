'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const Provider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
        <Toaster
          position='top-right'
          toastOptions={{
            success: {
              style: {
                background: 'green',
                color: 'white',
              },
            },
            error: {
              style: {
                background: '#ab0000',
                color: 'white',
              },
            },
          }}
        />
        {children}
    </QueryClientProvider>
  );
};

export default Provider;