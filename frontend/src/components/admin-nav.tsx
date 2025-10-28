'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Formulários', href: '/admin/forms' },
  { name: 'Respondentes', href: '/admin/respondents' },
  { name: 'Respostas', href: '/admin/responses' },
  { name: 'Relatórios', href: '/admin/reports' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-6">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-sintegra-blue',
              isActive
                ? 'text-sintegra-blue border-b-2 border-sintegra-blue'
                : 'text-sintegra-gray-dark'
            )}
          >
            {item.name}
          </Link>
        )
      })}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="ml-4"
      >
        Sair
      </Button>
    </nav>
  )
}
