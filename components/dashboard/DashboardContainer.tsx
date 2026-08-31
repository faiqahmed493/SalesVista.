"use client";

import React, { useState, useCallback, useEffect } from "react";
import type { SalesDashboardData } from "@/lib/data/sales/salesService";
import type { VisualizationConfig } from "@/lib/visualization/types";
import type { VisualizationPayload } from "@/lib/ai/chatTypes";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KpiGrid from "@/components/dashboard/KpiGrid";
import ChartRenderer from "@/components/visualization/ChartRenderer";
import ChatPanel, { AskAiButton } from "@/components/chat/ChatPanel";
import { KpiCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";

const CHAT_PANEL_WIDTH = 380;

// Baseline Visualization Configurations
const CATEGORY_CHART_CONFIG: VisualizationConfig = {
  type: "bar",
  title: "Sales & Profit by Product Category",
  description: "Total revenue and net profit across Furniture, Office Supplies, and Technology",
  xKey: "category",
  series: [
    { key: "sales", label: "Total Sales ($)", color: "#3b82f6" },
    { key: "profit", label: "Total Profit ($)", color: "#10b981" },
  ],
  tooltip: { enabled: true, decimals: 2 },
  height: 320,
};

const MONTHLY_TREND_CONFIG: VisualizationConfig = {
  type: "area",
  title: "Monthly Sales & Profit Trend",
  description: "Revenue trajectory over time with profit volume overlay",
  xKey: "month",
  series: [
    { key: "sales", label: "Sales ($)", color: "#3b82f6", fillOpacity: 0.25 },
    { key: "profit", label: "Profit ($)", color: "#10b981", fillOpacity: 0.35 },
  ],
  tooltip: { enabled: true, decimals: 2 },
  height: 320,
};

interface DashboardContainerProps {
  initialData: SalesDashboardData | null;
}

export default function DashboardContainer({ initialData }: DashboardContainerProps) {
  const [data, setData] = useState<SalesDashboardData | null>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(
    initialData ? new Date() : null
  );
  const [chatOpen, setChatOpen] = useState(false);
  const [dashboardVisualizations, setDashboardVisualizations] = useState<
    VisualizationPayload[]
  >([]);

  const fetchSalesData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sales");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setLastRefreshed(new Date());
      } else {
        setError(result.error || "Failed to load sales dashboard data");
      }
    } catch (err) {
      console.error("[DashboardContainer] Error fetching sales data:", err);
      setError("Could not load sales dashboard data. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount if no initial data provided
  useEffect(() => {
    let isMounted = true;
    if (!initialData) {
      fetch("/api/sales")
        .then((res) => res.json())
        .then((result) => {
          if (isMounted) {
            if (result.success) {
              setData(result.data);
              setLastRefreshed(new Date());
            } else {
              setError(result.error || "Failed to load sales dashboard data");
            }
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setError("Could not load sales dashboard data. Check your connection.");
            setIsLoading(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [initialData]);

  const handleSimulateOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sales/generate", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error("[DashboardContainer] Error simulating order:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddToDashboard = useCallback((visualization: VisualizationPayload) => {
    setDashboardVisualizations((current) =>
      current.some(
        (item) =>
          item.config.title === visualization.config.title &&
          item.config.type === visualization.config.type
      )
        ? current
        : [...current, visualization]
    );
  }, []);

  const showSkeleton = isLoading && !data;

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* Sticky Header */}
      <DashboardHeader
        isLoading={isLoading}
        lastRefreshed={lastRefreshed}
        onSimulateOrder={handleSimulateOrder}
        onRefresh={fetchSalesData}
      />

      {/* Main Content */}
      <main
        style={{
          maxWidth: chatOpen ? `calc(100% - ${CHAT_PANEL_WIDTH + 16}px)` : 1400,
          margin: chatOpen ? "0" : "0 auto",
          padding: "28px 24px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          opacity: isLoading && data ? 0.7 : 1,
          transition: "max-width 0.25s ease, margin 0.25s ease, opacity 0.2s ease",
        }}
      >
        {/* Error Notification */}
        {error && !data && (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "32px 24px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#ef4444", fontWeight: 600 }}>{error}</p>
            <button
              onClick={fetchSalesData}
              style={{
                marginTop: 12,
                padding: "8px 16px",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Section 1: KPI Cards */}
        <section aria-label="Sales KPI Metrics">
          {showSkeleton ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <KpiCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <KpiGrid kpis={data?.kpis} />
          )}
        </section>

        {/* Section 2: Baseline Breakdown Visualizations */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
            gap: 20,
          }}
          aria-label="Sales breakdown charts"
        >
          {showSkeleton ? (
            <>
              <ChartSkeleton height={320} />
              <ChartSkeleton height={320} />
            </>
          ) : data ? (
            <>
              <ChartRenderer
                config={CATEGORY_CHART_CONFIG}
                data={data.salesByCategory}
              />
              <ChartRenderer
                config={MONTHLY_TREND_CONFIG}
                data={data.monthlySalesTrend}
              />
            </>
          ) : null}
        </section>

        {/* Section 3: AI Visualizations (Pinned from Chat) */}
        {dashboardVisualizations.length > 0 && (
          <section aria-label="AI pinned visualizations">
            <div style={{ marginBottom: 14 }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--foreground)",
                }}
              >
                AI Visualizations
              </h2>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Custom charts pinned directly from your Text-to-SQL AI conversations
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
                gap: 20,
              }}
            >
              {dashboardVisualizations.map((visualization, index) => (
                <ChartRenderer
                  key={`${visualization.config.title}-${index}`}
                  config={visualization.config}
                  data={visualization.data}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 16,
            borderTop: "1px solid var(--border)",
            fontSize: 11,
            color: "var(--muted-foreground)",
          }}
        >
          <p>Superstore Dataset · Internal Sales Business Intelligence Dashboard</p>
          <p>Powered by SQLite WAL & Gemini 2.5 Text-to-SQL Pipeline</p>
        </footer>
      </main>

      {/* AI Chat Panel */}
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        locationName="Superstore Sales"
        onAddToDashboard={handleAddToDashboard}
      />

      {/* Floating Trigger Button */}
      {!chatOpen && <AskAiButton onClick={() => setChatOpen(true)} />}
    </div>
  );
}
