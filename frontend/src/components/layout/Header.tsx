"use client";

import { usePathname } from "next/navigation";
import { FileText, Users, BarChart3, LayoutDashboard } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const pathname = usePathname();

  // Auto-detect title based on route if not provided
  const getPageInfo = () => {
    if (title && subtitle) {
      return { title, subtitle };
    }

    if (pathname.includes('/forms')) {
      return {
        title: 'Formulários NPS',
        subtitle: 'Crie e gerencie seus formulários de pesquisa',
      };
    }
    if (pathname.includes('/respondents')) {
      return {
        title: 'Respondentes',
        subtitle: 'Gerencie sua base de contatos',
      };
    }
    if (pathname.includes('/reports')) {
      return {
        title: 'Relatórios',
        subtitle: 'Análises e insights das pesquisas',
      };
    }
    if (pathname.includes('/dashboard')) {
      return {
        title: 'Dashboard',
        subtitle: 'Visão geral do sistema NPS',
      };
    }

    return {
      title: 'Sistema NPS',
      subtitle: 'Síntegra - Net Promoter Score',
    };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 shadow-brand">
      <div className="px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            {pathname.includes('/forms') && <FileText className="w-6 h-6 text-white" />}
            {pathname.includes('/respondents') && <Users className="w-6 h-6 text-white" />}
            {pathname.includes('/reports') && <BarChart3 className="w-6 h-6 text-white" />}
            {pathname.includes('/dashboard') && <LayoutDashboard className="w-6 h-6 text-white" />}
            {!pathname.includes('/forms') && 
             !pathname.includes('/respondents') && 
             !pathname.includes('/reports') && 
             !pathname.includes('/dashboard') && (
              <span className="text-white font-bold text-xl">S</span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {pageInfo.title}
            </h1>
            <p className="text-primary-50 text-sm mt-1">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
