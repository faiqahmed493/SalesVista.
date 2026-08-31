import React from "react";
import type { DashboardKPIs } from "@/lib/data/sales/salesService";

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accentColor?: string;
}

function KpiCard({ icon, label, value, sub, accentColor = "#3b82f6" }: KpiCardProps) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        transition: "box-shadow 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: `${accentColor}1a`,
            color: accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--foreground)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 11,
            color: "var(--muted-foreground)",
            marginTop: 4,
            lineHeight: 1.4,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

/* Icons */
const DollarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);

const PackageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const PercentIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);

interface KpiGridProps {
  kpis?: DashboardKPIs;
}

export default function KpiGrid({ kpis }: KpiGridProps) {
  const totalSales = kpis?.totalSales ?? 0;
  const totalProfit = kpis?.totalProfit ?? 0;
  const totalOrders = kpis?.totalOrders ?? 0;
  const averageDiscount = kpis?.averageDiscount ?? 0;

  const cardList: KpiCardProps[] = [
    {
      label: "Total Sales",
      icon: <DollarIcon />,
      value: `$${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: "Cumulative Superstore revenue",
      accentColor: "#3b82f6",
    },
    {
      label: "Total Profit",
      icon: <TrendingUpIcon />,
      value: `$${totalProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: `Profit margin: ${((totalProfit / (totalSales || 1)) * 100).toFixed(1)}%`,
      accentColor: "#10b981",
    },
    {
      label: "Total Orders",
      icon: <PackageIcon />,
      value: totalOrders.toLocaleString("en-US"),
      sub: "Unique transaction orders",
      accentColor: "#8b5cf6",
    },
    {
      label: "Average Discount",
      icon: <PercentIcon />,
      value: `${(averageDiscount * 100).toFixed(2)}%`,
      sub: "Average rate across orders",
      accentColor: "#f59e0b",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
      }}
      className="kpi-grid"
    >
      <style>{`
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .kpi-grid { grid-template-columns: repeat(1, 1fr) !important; }
        }
      `}</style>
      {cardList.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}
