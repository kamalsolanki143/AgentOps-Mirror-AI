"use client";
import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  const roundedClass = {
    sm: "rounded",
    md: "rounded-lg",
    lg: "rounded-2xl",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-[#F3F4F6] via-[#E9EAEC] to-[#F3F4F6]",
        "bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]",
        roundedClass,
        className
      )}
      style={{
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

// Add shimmer to globals.css via style tag for server-side compat
// We inline it here as a fallback:
const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div
        className={cn(
          "bg-bg-surface rounded-2xl border border-[#E5E7EB] shadow-card p-6",
          className
        )}
      >
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="w-12 h-12" rounded="full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </>
  );
}
