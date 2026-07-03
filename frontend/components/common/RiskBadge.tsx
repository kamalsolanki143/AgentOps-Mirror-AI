"use client";
import { cn } from "@/utils/cn";
import type { RiskLevel } from "@/types/run.types";
import { getRiskMeta } from "@/utils/riskLevel";

interface RiskBadgeProps {
  level: RiskLevel;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}

export function RiskBadge({ level, count, size = "md", className }: RiskBadgeProps) {
  const meta = getRiskMeta(level);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-sans font-medium rounded-lg border",
        meta.bgColor,
        meta.color,
        meta.borderColor,
        size === "sm" ? "px-2 py-0.5 text-2xs" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0 font-bold leading-tight",
            size === "sm" ? "text-2xs" : "text-xs",
            meta.bgColor
          )}
        >
          {count}
        </span>
      )}
    </span>
  );
}
