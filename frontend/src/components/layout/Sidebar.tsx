"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  UserCog,
  Wrench,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  User,
  Calendar,
  Database,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

interface SettingsSubItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  superAdminOnly?: boolean;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Formulários", href: "/admin/forms", icon: FileText },
  { name: "Respondentes", href: "/admin/respondents", icon: Users },
  { name: "Feedbacks", href: "/admin/feedbacks", icon: MessageSquare },
  { name: "Relatórios", href: "/admin/reports", icon: BarChart3, adminOnly: true },
];

const settingsSubItems: SettingsSubItem[] = [
  { name: "Geral", href: "/admin/settings", icon: Settings },
  { name: "Usuários", href: "/admin/settings/users", icon: UserCog, superAdminOnly: true },
  { name: "Momentos de Pesquisa", href: "/admin/settings/survey-moments", icon: Calendar, superAdminOnly: true },
  { name: "Migração de Dados", href: "/admin/settings/data-migration", icon: Database, superAdminOnly: true },
  { name: "Admin Setup", href: "/admin/settings/admin-setup", icon: Wrench, superAdminOnly: true },
];

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "SUPER_ADMIN" || (session?.user as any)?.role === "ADMIN";
  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const filteredSettingsItems = settingsSubItems.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  // Auto-expand settings if user is on a settings page
  const isOnSettingsPage = pathname.startsWith("/admin/settings");
  if (isOnSettingsPage && !settingsExpanded) {
    setSettingsExpanded(true);
  }

  // Close mobile menu when route changes
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [pathname]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 80 : 280,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 h-screen z-50 flex flex-col",
          "bg-white border-r border-gray-200",
          "shadow-lg",
          // Desktop: Always visible
          "hidden lg:flex",
          // Mobile: Show/hide based on mobileOpen
          mobileOpen && "!flex"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <Image
                  src="/assets/logos/sintegra-logo.png"
                  alt="Síntegra Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-lg object-contain"
                />
                <div>
                  <h1 className="font-bold text-lg text-secondary-900">
                    Síntegra
                  </h1>
                  <p className="text-xs text-secondary-500">
                    NPS System
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <Image
              src="/assets/logos/sintegra-logo.png"
              alt="Síntegra Logo"
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg object-contain mx-auto"
            />
          )}

          {/* Mobile Close Button */}
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                      "hover:bg-primary-50",
                      isActive
                        ? "bg-gradient-sintegra text-white shadow-md"
                        : "text-secondary-700"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 flex-shrink-0")} />
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="font-medium text-sm"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Settings */}
        <div className="border-t border-gray-200 p-3 space-y-2">
          {/* Settings Section - Expandable */}
          <div className="space-y-1">
            <button
              onClick={() => !collapsed && setSettingsExpanded(!settingsExpanded)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                "hover:bg-secondary-100",
                "text-secondary-700",
                isOnSettingsPage && "bg-secondary-100"
              )}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">Configurações</span>
                  {settingsExpanded ? (
                    <ChevronUp className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  )}
                </>
              )}
            </button>

            {/* Settings Sub-items */}
            <AnimatePresence>
              {settingsExpanded && !collapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pl-4 space-y-1 overflow-hidden"
                >
                  {filteredSettingsItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link key={item.href} href={item.href} onClick={handleLinkClick}>
                        <div
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                            "hover:bg-secondary-50",
                            isActive
                              ? "bg-gradient-sintegra text-white shadow-sm"
                              : "text-secondary-600"
                          )}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Info */}
          {session?.user && (
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg",
                "bg-secondary-50"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-sintegra flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-secondary-900 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {(session.user as any).role === "SUPER_ADMIN"
                      ? "Super Admin"
                      : "Administrador"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
              "hover:bg-red-50",
              "text-red-600"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>

        {/* Collapse Toggle - Desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full",
            "bg-white border-2 border-gray-200",
            "items-center justify-center shadow-md",
            "hover:bg-primary-50",
            "transition-colors duration-200"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-secondary-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-secondary-600" />
          )}
        </button>
      </motion.aside>

      {/* Spacer for content - Desktop only */}
      <div
        style={{ width: collapsed ? 80 : 280 }}
        className="hidden lg:block flex-shrink-0 transition-all duration-300"
      />
    </>
  );
}
