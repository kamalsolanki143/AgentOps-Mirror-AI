"use client";
import { cn } from "@/utils/cn";
import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gradient";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md",
  secondary:
    "bg-bg-surface text-ink border border-[#E5E7EB] hover:border-primary/40 hover:bg-bg-base shadow-sm",
  ghost:
    "text-ink-muted hover:text-ink hover:bg-[#F3F4F6]",
  danger:
    "bg-risk-critical text-white hover:bg-risk-critical/90 shadow-sm",
  gradient:
    "bg-gradient-signature text-white shadow-sm hover:shadow-ring-glow",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm font-medium rounded-xl gap-2",
  lg: "px-6 py-3 text-base font-semibold rounded-xl gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "font-sans select-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {children}
        {rightIcon && !loading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
