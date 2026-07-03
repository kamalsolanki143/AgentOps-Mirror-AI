"use client";
import { cn } from "@/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
  as?: "div" | "article" | "section" | "li";
}

export function Card({
  children,
  className,
  hover = false,
  gradient = false,
  onClick,
  as: Tag = "div",
}: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "bg-bg-surface rounded-2xl border border-[#E5E7EB] shadow-card",
        "transition-all duration-200",
        hover && "cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5",
        gradient && "bg-gradient-card",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("px-6 pt-6 pb-4", className)}>{children}</div>
  );
}

export function CardBody({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("px-6 pb-6", className)}>{children}</div>
  );
}

export function CardFooter({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-[#E5E7EB] flex items-center gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}
