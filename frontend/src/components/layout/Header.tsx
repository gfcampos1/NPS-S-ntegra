"use client";

import { usePathname } from "next/navigation";
import { FileText, Users, BarChart3, LayoutDashboard, MessageSquare, Wrench, UserCog, Menu } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onMobileMenuToggle?: () => void;
}

export function Header({ title, subtitle, onMobileMenuToggle }: HeaderProps) {
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
    if (pathname.includes('/feedbacks')) {
      return {
        title: 'Feedbacks',
        subtitle: 'Comentários e respostas de texto',
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
        subtitle: 'Visão geral do NPS Manager',
      };
    }
    if (pathname.includes('/admin-setup')) {
      return {
        title: 'Configuração de Administrador',
        subtitle: 'Gerenciamento avançado do sistema',
      };
    }
    if (pathname.includes('/users')) {
      return {
        title: 'Gerenciamento de Usuários',
        subtitle: 'Controle de permissões e roles',
      };
    }

    return {
      title: 'NPS Manager',
      subtitle: 'Sistema de gerenciamento de feedbacks e net promoter score',
    };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 shadow-lg">
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Icon */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
            {pathname.includes('/forms') && <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            {pathname.includes('/respondents') && <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            {pathname.includes('/feedbacks') && <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            {pathname.includes('/reports') && <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            {pathname.includes('/dashboard') && <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            {pathname.includes('/users') && <UserCog className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            {pathname.includes('/admin-setup') && <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            {!pathname.includes('/forms') &&
             !pathname.includes('/respondents') &&
             !pathname.includes('/feedbacks') &&
             !pathname.includes('/reports') &&
             !pathname.includes('/users') &&
             !pathname.includes('/admin-setup') &&
             !pathname.includes('/dashboard') && (
              <span className="text-white font-bold text-base sm:text-lg">S</span>
            )}
          </div>

          {/* Title and Subtitle */}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
              {pageInfo.title}
            </h1>
            <p className="text-primary-100 text-xs sm:text-sm mt-0.5 truncate">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
