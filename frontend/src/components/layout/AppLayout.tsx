'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loading } from '../ui/Loading';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const staticPublicRoutes = ['/login', '/'];

function AppLayoutContent({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { mobileOpen, setMobileOpen } = useSidebar();

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

  // Admin routes use their own layout with sidebar
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;

  if (isPublicRoute || isAdminRoute) {
    return <>{children}</>;
  }

  // Other protected routes - with sidebar and header
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
