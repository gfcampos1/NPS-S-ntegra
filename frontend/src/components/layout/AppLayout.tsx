'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Loading } from '../ui/Loading';

interface AppLayoutProps {
  children: React.ReactNode;
}

const publicRoutes = ['/login', '/'];

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'loading' || !mounted) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!session && !isPublicRoute) {
      router.push('/login');
    }
  }, [session, status, pathname, router, mounted]);

  // Show loading on initial mount
  if (!mounted) {
    return null;
  }

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-secondary-900">
        <Loading size="lg" text="Carregando..." />
      </div>
    );
  }

  // Public routes (login, etc) - no sidebar
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes - with sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
