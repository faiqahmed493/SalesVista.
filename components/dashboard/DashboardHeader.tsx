"use client";

import React from "react";
import RefreshButton from "@/components/dashboard/RefreshButton";
import { useRouter } from "next/navigation";



interface DashboardHeaderProps {
  isLoading: boolean;
  lastRefreshed: Date | null;
  onRefresh: () => void;
}

export default function DashboardHeader({
  isLoading,
  lastRefreshed,
  onRefresh,
}: DashboardHeaderProps) {
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

