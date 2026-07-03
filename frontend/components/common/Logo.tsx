"use client";
import Link from "next/link";
import { cn } from "@/utils/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  collapsed?: boolean;
  className?: string;
  href?: string;
}

const sizeMap = {
  sm: { icon: 24, text: "text-sm" },
  md: { icon: 32, text: "text-base" },
  lg: { icon: 40, text: "text-xl" },
};

export function Logo({ size = "md", collapsed = false, className, href = "/" }: LogoProps) {
  const { icon, text } = sizeMap[size];

  const content = (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      {/* Logo mark — stylized "M" mirror */}
      <div
        className="flex-shrink-0 relative rounded-xl overflow-hidden"
        style={{ width: icon, height: icon }}
      >
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6C5CE7" />
              <stop offset="100%" stopColor="#00C2A8" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
          {/* Mirror "M" shape */}
          <path
            d="M7 22V10L16 17L25 10V22"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Reflection line */}
          <line
            x1="7"
            y1="26"
            x2="25"
            y2="26"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Wordmark — hidden when collapsed */}
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-bold gradient-text",
              text
            )}
          >
            Mirror AI
          </span>
          <span className="text-2xs text-ink-muted font-sans">AgentOps</span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
