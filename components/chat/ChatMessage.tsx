"use client";

import React, { useState } from "react";
import type { ChatMessage, VisualizationPayload } from "@/lib/ai/chatTypes";
import ChartRenderer from "@/components/visualization/ChartRenderer";

// ─── Add to Dashboard button ──────────────────────────────────────────────────

function AddToDashboardButton({
  messageId,
  visualization,
  onAdd,
}: {
  messageId: string;
  visualization: VisualizationPayload;
  onAdd: (visualization: VisualizationPayload) => void;
}) {
  const [state, setState] = useState<"idle" | "added">("idle");

  const handleClick = () => {
    onAdd(visualization);
    setState("added");
    setTimeout(() => setState("idle"), 3000);
  };

  if (state === "added") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11,
          fontWeight: 600,
          color: "#10b981",
          padding: "5px 0",
          userSelect: "none",
        }}
        aria-live="polite"
      >
        <span>✓</span>
        <span>Added to Dashboard</span>
      </div>
    );
  }

  return (
    <button
      id={`add-to-dashboard-${messageId}`}
      onClick={handleClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 600,
        color: "var(--accent)",
        background: "transparent",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "5px 10px",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--muted)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
      aria-label="Add this chart to the main dashboard"
    >
      <span>＋</span>
      <span>Add to Dashboard</span>
    </button>
  );
}

// ─── User message bubble ──────────────────────────────────────────────────────

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: 14,
        animation: "chatFadeUp 0.18s ease",
      }}
    >
      <div
        style={{
          background: "var(--accent)",
          color: "var(--accent-foreground)",
          borderRadius: "16px 16px 4px 16px",
          padding: "10px 14px",
          maxWidth: "82%",
          fontSize: 13,
          lineHeight: 1.55,
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
    </div>
  );
}

// ─── Assistant message card ───────────────────────────────────────────────────

function AssistantCard({
  message,
  onAddToDashboard,
}: {
  message: ChatMessage;
  onAddToDashboard: (visualization: VisualizationPayload) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 16,
        animation: "chatFadeUp 0.22s ease",
      }}
    >
      {/* AI avatar */}
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "var(--muted)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          flexShrink: 0,
          marginTop: 2,
        }}
        aria-hidden="true"
      >
        ✦
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Error state */}
        {message.isError ? (
          <div
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "16px 16px 16px 4px",
              padding: "10px 14px",
              fontSize: 13,
              color: "#ef4444",
              lineHeight: 1.55,
            }}
          >
            {message.content}
          </div>
        ) : (
          <>
            {/* Text answer */}
            <div
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border)",
                borderRadius: "16px 16px 16px 4px",
                padding: "11px 14px",
                fontSize: 13,
                lineHeight: 1.65,
                color: "var(--foreground)",
                wordBreak: "break-word",
              }}
            >
              {message.content}
            </div>

            {/* Insights list */}
            {message.insights && message.insights.length > 0 && (
              <ul
                style={{
                  margin: 0,
                  padding: "0 0 0 4px",
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {message.insights.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 12,
                      color: "var(--muted-foreground)",
                      paddingLeft: 8,
                      borderLeft: "2px solid var(--border)",
                      lineHeight: 1.5,
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {/* Query data table */}
            {message.queryData && message.queryData.length > 0 && (() => {
              const columns = Array.from(
                new Set(message.queryData.flatMap((row) => Object.keys(row)))
              );
              const rows = message.queryData.slice(0, 5);

              return (
                <div
                  style={{
                    background: "rgba(15,23,42,0.02)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--muted-foreground)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      borderBottom: "1px solid var(--border)",
                      background: "rgba(148,163,184,0.05)",
                    }}
                  >
                    Query data
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr>
                          {columns.map((column) => (
                            <th
                              key={column}
                              style={{
                                textAlign: "left",
                                padding: "8px 10px",
                                borderBottom: "1px solid var(--border)",
                                color: "var(--muted-foreground)",
                                background: "rgba(148,163,184,0.04)",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {columns.map((column) => {
                              const value = row[column];
                              const displayValue = value === null || value === undefined ? "—" : String(value);
                              return (
                                <td
                                  key={`${rowIndex}-${column}`}
                                  style={{
                                    padding: "8px 10px",
                                    borderBottom: rowIndex === rows.length - 1 ? "none" : "1px solid var(--border)",
                                    color: "var(--foreground)",
                                    verticalAlign: "top",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {displayValue}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Embedded chart */}
            {message.visualization && (
              <ChartRenderer
                config={message.visualization.config}
                data={message.visualization.data}
              />
            )}

            {/* Add to Dashboard action */}
            {message.canAddToDashboard && message.visualization && (
              <div>
                <AddToDashboardButton
                  messageId={message.id}
                  visualization={message.visualization}
                  onAdd={onAddToDashboard}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface ChatMessageProps {
  message: ChatMessage;
  onAddToDashboard: (visualization: VisualizationPayload) => void;
}

/**
 * Renders a single conversation message.
 *
 * User messages: right-aligned accent bubble.
 * Assistant messages: left-aligned card with optional chart + insights + action.
 */
export default function ChatMessageItem({ message, onAddToDashboard }: ChatMessageProps) {
  return (
    <>
      {message.role === "user" ? (
        <UserBubble message={message} />
      ) : (
        <AssistantCard message={message} onAddToDashboard={onAddToDashboard} />
      )}
      <style>{`
        @keyframes chatFadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
