"use client";
import { cn } from "@/utils/cn";


interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-4 mb-8",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1.5 mb-2" aria-label="Breadcrumb">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-ink-muted text-sm">/</span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-sm text-ink-muted hover:text-ink transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-sm text-ink font-medium">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-display font-bold text-ink truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-ink-muted mt-1 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
