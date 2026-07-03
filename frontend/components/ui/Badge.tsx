"use client";
import { cn } from "@/utils/cn";
import type { RiskLevel } from "@/types/run.types";
import { getRiskMeta } from "@/utils/riskLevel";

type BadgeVariant = "default" | "primary" | "accent" | "risk" | "ghost";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  riskLevel?: RiskLevel;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[#F3F4F6] text-ink-muted border border-[#E5E7EB]",
  primary: "bg-primary/10 text-primary border border-primary/20",
  accent: "bg-accent/10 text-accent border border-accent/20",
  risk: "", // computed from riskLevel prop
  ghost: "bg-transparent text-ink-muted border border-[#E5E7EB]",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-2xs font-medium rounded-md gap-1",
  md: "px-2.5 py-1 text-xs font-medium rounded-lg gap-1.5",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  riskLevel,
  dot = false,
  className,
}: BadgeProps) {
  let computedClasses = variantClasses[variant];

  if (variant === "risk" && riskLevel) {
    const meta = getRiskMeta(riskLevel);
    computedClasses = `${meta.bgColor} ${meta.color} border ${meta.borderColor}`;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-sans",
        computedClasses,
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            variant === "risk" && riskLevel
              ? riskLevel === "critical"
                ? "bg-risk-critical"
                : riskLevel === "medium"
                ? "bg-risk-medium"
                : riskLevel === "low"
                ? "bg-risk-low"
                : "bg-accent"
              : "bg-current"
          )}
        />
      )}
      {children}
    </span>
  );
}
