'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      {children}
    </AuthProvider>
  );
}
