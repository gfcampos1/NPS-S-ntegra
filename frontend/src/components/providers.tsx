'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import { AppLayout } from './layout/AppLayout'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppLayout>
        {children}
      </AppLayout>
      <Toaster 
        position="top-right"
        richColors
        closeButton
      />
    </SessionProvider>
  )
}
