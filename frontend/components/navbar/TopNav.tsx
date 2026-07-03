"use client";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/common/Logo";
import { ROUTES, NAV_ITEMS } from "@/constants/routes";
import { Menu, X, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Zap, Users, FileText, BarChart2, Plug, Settings,
  type LucideIcon
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Zap, Users, FileText, BarChart2, Plug, Settings,
};

export function TopNav() {
  const { sidebarCollapsed } = useAppStore();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  const marginLeft = sidebarCollapsed ? "md:ml-16" : "md:ml-60";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-30 h-16",
          "bg-bg-surface/90 backdrop-blur-md border-b border-[#E5E7EB]",
          "flex items-center px-4 gap-4 transition-all duration-250",
          marginLeft
        )}
      >
        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-[#F3F4F6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile logo */}
        <div className="md:hidden">
          <Logo size="sm" href={ROUTES.DASHBOARD} />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-[#F3F4F6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-risk-critical border-2 border-bg-surface" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[#F3F4F6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-signature flex items-center justify-center text-white text-sm font-bold font-display flex-shrink-0">
                {user?.name?.charAt(0) ?? "U"}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-semibold text-ink truncate max-w-[120px]">
                  {user?.name ?? "User"}
                </span>
                <span className="text-2xs text-ink-muted">{user?.orgName ?? "AgentOps"}</span>
              </div>
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-bg-surface border border-[#E5E7EB] rounded-xl shadow-card-hover z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E5E7EB]">
                    <p className="text-xs font-semibold text-ink">{user?.name}</p>
                    <p className="text-2xs text-ink-muted">{user?.email}</p>
                  </div>
                  <ul className="py-1">
                    {[
                      { label: "Settings", href: ROUTES.SETTINGS },
                      { label: "Integrations", href: ROUTES.INTEGRATIONS },
                    ].map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-ink-muted hover:text-ink hover:bg-[#F9FAFB] transition-colors"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li className="border-t border-[#E5E7EB] mt-1 pt-1">
                      <button
                        onClick={() => { setUserMenuOpen(false); logout(); }}
                        className="w-full text-left px-4 py-2 text-sm text-risk-critical hover:bg-risk-critical-bg transition-colors"
                      >
                        Sign out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="absolute left-0 top-0 bottom-0 w-72 bg-bg-surface shadow-xl flex flex-col">
            <div className="flex items-center justify-between h-16 px-5 border-b border-[#E5E7EB]">
              <Logo size="md" href={ROUTES.DASHBOARD} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-[#F3F4F6] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = ICON_MAP[item.icon];
                const isActive =
                  item.href === ROUTES.DASHBOARD
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-ink-muted hover:text-ink hover:bg-[#F3F4F6]"
                      )}
                    >
                      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
