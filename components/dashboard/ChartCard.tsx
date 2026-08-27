import React from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * Consistent wrapper card for chart sections.
 * Separates chart layout concerns from chart rendering.
 */
export default function ChartCard({
  title,
  subtitle,
  action,
  children,
  className = "",
  noPadding = false,
}: ChartCardProps) {
  return (
    <div
      className={`bg-card border border-border rounded-xl flex flex-col ${className}`}
    >
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground leading-none">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div className="ml-4 shrink-0">{action}</div>}
      </div>
      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </div>
  );
}
