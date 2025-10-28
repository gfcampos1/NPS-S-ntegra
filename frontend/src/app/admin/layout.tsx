'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AdminNav } from '@/components/admin-nav'
import Image from 'next/image'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 relative">
                <Image
                  src="/assets/logos/sintegra-logo.svg"
                  alt="Síntegra"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-bold text-sintegra-blue">
                Sistema NPS
              </h1>
            </div>
            <AdminNav />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-sintegra-gray-dark">
                  {session.user.name}
                </div>
                <div className="text-xs text-sintegra-gray-medium">
                  {session.user.role}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6">{children}</main>
    </div>
  )
}
