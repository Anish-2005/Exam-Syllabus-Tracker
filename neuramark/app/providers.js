// app/providers.js
'use client'
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}