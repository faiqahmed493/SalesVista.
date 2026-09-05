"use client";

import React, { useState } from "react";
import RefreshButton from "@/components/dashboard/RefreshButton";
import { useRouter } from "next/navigation";



interface DashboardHeaderProps {
  isLoading: boolean;
  lastRefreshed: Date | null;
  onSimulateOrder: () => Promise<void>;
  onRefresh: () => void;
}

export default function DashboardHeader({
  isLoading,
  lastRefreshed,
  onSimulateOrder,
  onRefresh,
}: DashboardHeaderProps) {
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateClick = async () => {
    setIsSimulating(true);
    try {
      await onSimulateOrder();
    } finally {
      setIsSimulating(false);
    }
  };

   const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--card)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Left: title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--foreground)",
                letterSpacing: "-0.02em",
              }}
            >
              Sales Intelligence Dashboard
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#10b981",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: 12,
                padding: "2px 8px",
                fontWeight: 600,
              }}
            >
              SQLite WAL
            </span>
          </div>
          <span
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
            }}
          >
            Superstore BI Analytics & AI Text-to-SQL Pipeline
          </span>
        </div>

        {/* Right: controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button
            onClick={handleSimulateClick}
            disabled={isLoading || isSimulating}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              background: "#3b82f6",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: isLoading || isSimulating ? "not-allowed" : "pointer",
              opacity: isLoading || isSimulating ? 0.7 : 1,
              transition: "all 0.15s ease",
              boxShadow: "0 1px 3px rgba(59, 130, 246, 0.3)",
            }}
          >
            <PlusIcon />
            {isSimulating ? "Simulating..." : "Simulate Order"}
          </button>

          <RefreshButton
            onRefresh={onRefresh}
            isLoading={isLoading}
            lastRefreshed={lastRefreshed}
          />
          <button onClick={logout}>Sign out</button>
        </div>
      </div>
    </header>
  );
}

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
