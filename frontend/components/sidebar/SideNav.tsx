"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { useAppStore } from "@/store/useAppStore";
import { Logo } from "@/components/common/Logo";
import { NAV_ITEMS, ROUTES } from "@/constants/routes";
import {
  LayoutDashboard,
  Zap,
  Users,
  FileText,
  BarChart2,
  Plug,
  Settings,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Zap,
  Users,
  FileText,
  BarChart2,
  Plug,
  Settings,
};

interface SideNavProps {
  className?: string;
}

export function SideNav({ className }: SideNavProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-40 flex flex-col",
          "bg-bg-surface border-r border-[#E5E7EB]",
          "transition-all duration-250 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-60",
          "hidden md:flex",
          className
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 border-b border-[#E5E7EB] flex-shrink-0",
          sidebarCollapsed ? "justify-center px-0" : "px-5"
        )}>
          <Logo
            size="md"
            collapsed={sidebarCollapsed}
            href={ROUTES.DASHBOARD}
          />
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="Main navigation">
          <ul className="space-y-0.5" role="list">
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
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                      "transition-all duration-150 group",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-ink-muted hover:text-ink hover:bg-[#F3F4F6]",
                      sidebarCollapsed && "justify-center px-0 py-3"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "flex-shrink-0 transition-colors",
                          sidebarCollapsed ? "w-5 h-5" : "w-4 h-4",
                          isActive ? "text-primary" : "text-ink-muted group-hover:text-ink"
                        )}
                      />
                    )}
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-[#E5E7EB] p-2">
          <button
            onClick={toggleSidebar}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ink-muted",
              "hover:bg-[#F3F4F6] hover:text-ink transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              sidebarCollapsed && "justify-center"
            )}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile spacer (sidebar takes up no space on mobile) */}
    </>
  );
}
