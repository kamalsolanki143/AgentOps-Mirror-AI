"use client";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-gradient-signature-soft flex items-center justify-center mb-5 text-3xl">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold font-display text-ink mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-ink-muted max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
