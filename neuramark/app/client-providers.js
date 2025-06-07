// app/client-providers.js
'use client'

import { ThemeProvider } from './context/ThemeContext'
import ServiceWorkerRegister from './components/ServiceWorkerRegister'
import OfflineStatus from './components/OfflineStatus'

export function ClientProviders({ children }) {
  return (
    <ThemeProvider>
      <ServiceWorkerRegister />
      <OfflineStatus />
      {children}
    </ThemeProvider>
  )
}