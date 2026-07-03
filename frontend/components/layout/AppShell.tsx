"use client";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { SideNav } from "@/components/sidebar/SideNav";
import { TopNav } from "@/components/navbar/TopNav";
import { useAppStore } from "@/store/useAppStore";

// Routes where we don't show the app shell (public pages)
const PUBLIC_ROUTES = ["/", "/login", "/register"];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { sidebarCollapsed } = useAppStore();

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  // Special: landing page "/" is public but login/register also public
  const isLanding = pathname === "/";

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh bg-bg-base">
      <SideNav />
      <TopNav />
      <main
        className={cn(
          "transition-all duration-250 ease-in-out pt-16",
          sidebarCollapsed ? "md:ml-16" : "md:ml-60"
        )}
      >
        {children}
      </main>
    </div>
  );
}
