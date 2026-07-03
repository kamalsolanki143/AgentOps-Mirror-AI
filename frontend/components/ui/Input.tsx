"use client";
import { cn } from "@/utils/cn";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-ink"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-ink-muted pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-bg-surface border border-[#E5E7EB] rounded-xl text-sm text-ink",
              "placeholder:text-ink-muted",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
              "disabled:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:text-ink-muted",
              error && "border-risk-critical focus:ring-risk-critical/30 focus:border-risk-critical",
              leftIcon ? "pl-10 pr-4 py-2.5" : "px-4 py-2.5",
              rightIcon ? "pr-10" : "",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-ink-muted">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-risk-critical font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-ink-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
