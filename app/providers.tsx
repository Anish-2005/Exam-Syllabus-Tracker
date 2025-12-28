// app/providers.js
'use client'
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import React, { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}