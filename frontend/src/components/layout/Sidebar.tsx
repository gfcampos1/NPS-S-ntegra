"use client";

import { useState } from "react";
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
  Wrench,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Formulários", href: "/admin/forms", icon: FileText },
  { name: "Respondentes", href: "/admin/respondents", icon: Users },
  { name: "Feedbacks", href: "/admin/feedbacks", icon: MessageSquare },
  { name: "Relatórios", href: "/admin/reports", icon: BarChart3, adminOnly: true },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "SUPER_ADMIN" || (session?.user as any)?.role === "ADMIN";
  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 h-screen z-40 flex flex-col",
          "bg-white border-r border-gray-200",
          "shadow-lg"
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
          {/* Settings Link */}
          <Link href="/admin/settings">
            <button
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                "hover:bg-secondary-100",
                "text-secondary-700"
              )}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">Configurações</span>
              )}
            </button>
          </Link>

          {/* Admin Setup Link - Super Admin Only */}
          {isSuperAdmin && (
            <Link href="/admin/admin-setup">
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                  "hover:bg-amber-50",
                  "text-amber-700",
                  pathname === "/admin/admin-setup" && "bg-amber-100"
                )}
              >
                <Wrench className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">Admin Setup</span>
                )}
              </button>
            </Link>
          )}

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

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute -right-3 top-20 w-6 h-6 rounded-full",
            "bg-white border-2 border-gray-200",
            "flex items-center justify-center shadow-md",
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

      {/* Spacer for content */}
      <div
        style={{ width: collapsed ? 80 : 280 }}
        className="flex-shrink-0 transition-all duration-300"
      />
    </>
  );
}
