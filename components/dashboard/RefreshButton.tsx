"use client";

import React from "react";

const RefreshIcon = ({ spinning }: { spinning: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: spinning ? "rotate(360deg)" : "rotate(0deg)",
      transition: spinning ? "transform 0.8s linear infinite" : "none",
      animation: spinning ? "spin 0.8s linear infinite" : "none",
    }}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading: boolean;
  lastRefreshed?: Date | null;
}

export default function RefreshButton({
  onRefresh,
  isLoading,
  lastRefreshed,
}: RefreshButtonProps) {
  const timeAgo = lastRefreshed ? formatRelativeTime(lastRefreshed) : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {timeAgo && (
        <span
          style={{
            fontSize: 11,
            color: "var(--muted-foreground)",
            whiteSpace: "nowrap",
          }}
        >
          Updated {timeAgo}
        </span>
      )}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        title="Refresh weather data"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "7px 12px",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          cursor: isLoading ? "not-allowed" : "pointer",
          fontSize: 12,
          fontWeight: 500,
          color: isLoading ? "var(--muted-foreground)" : "var(--foreground)",
          opacity: isLoading ? 0.7 : 1,
          transition: "all 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          if (!isLoading)
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
        }}
      >
        <RefreshIcon spinning={isLoading} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        {isLoading ? "Updating..." : "Refresh"}
      </button>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}
