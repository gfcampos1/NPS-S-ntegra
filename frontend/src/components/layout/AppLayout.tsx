'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loading } from '../ui/Loading';

interface AppLayoutProps {
  children: React.ReactNode;
}

const staticPublicRoutes = ['/login', '/'];

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'loading' || !mounted) return;

    const isRespondentRoute = pathname?.startsWith('/r/') ?? false;
    const isPublicRoute = staticPublicRoutes.includes(pathname) || isRespondentRoute;

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
  const isPublicRoute =
    staticPublicRoutes.includes(pathname) || (pathname?.startsWith('/r/') ?? false);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes - with sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <main className="flex-1 overflow-auto">
        <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
