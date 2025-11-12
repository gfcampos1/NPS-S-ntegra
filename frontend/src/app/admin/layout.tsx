'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { PasswordChangeGuard } from '@/components/PasswordChangeGuard'
import { Sidebar } from '@/components/layout/Sidebar'
import { useSidebar } from '@/contexts/SidebarContext'
import { Menu } from 'lucide-react'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { setMobileOpen, collapsed } = useSidebar()

  return (
    <>
      <Sidebar />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center px-4 z-30">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="ml-3 font-bold text-lg text-secondary-900">Síntegra NPS</h1>
      </div>

      {/* Main Content */}
      <main className={`pt-16 lg:pt-0 container mx-auto p-6 transition-all duration-300 ${collapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'}`}>
        {children}
      </main>
    </>
  )
}

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
    <PasswordChangeGuard>
      <div className="bg-gray-50">
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </div>
    </PasswordChangeGuard>
  )
}
