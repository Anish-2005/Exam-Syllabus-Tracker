// app/client-providers.js
'use client'

import { ThemeProvider } from './context/ThemeContext'
import ServiceWorkerRegister from './components/ServiceWorkerRegister'
import OfflineStatus from './components/OfflineStatus'

import { ReactNode } from 'react';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ServiceWorkerRegister />
      <OfflineStatus />
      {children}
    </ThemeProvider>
  )
}