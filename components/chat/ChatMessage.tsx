"use client";

import React, { useState } from "react";
import type { ChatMessage, VisualizationPayload } from "@/lib/ai/chatTypes";
import ChartRenderer from "@/components/visualization/ChartRenderer";
import { useSavedInsights } from "@/lib/context/SavedInsightsContext";

// ─── Save to Insights Button ──────────────────────────────────────────────────

function SaveToInsightsButton({
  messageId,
  visualization,
}: {
  messageId: string;
  visualization: VisualizationPayload;
}) {
  const { saveVisualization, isSaved } = useSavedInsights();
  const alreadySaved = isSaved(visualization.config.title, visualization.config.type);
  const [added, setAdded] = useState(alreadySaved);

  const handleClick = () => {
    saveVisualization(visualization);
    setAdded(true);
  };

  if (added || alreadySaved) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 600,
          color: "#12B886",
          backgroundColor: "#E6FBF2",
          border: "1px solid #B2F2BB",
          borderRadius: 20,
          padding: "6px 14px",
          userSelect: "none",
        }}
        aria-live="polite"
      >
        <span>✓</span>
        <span>Saved to Insights</span>
      </div>
    );
  }

  return (
    <button
      id={`save-to-insights-${messageId}`}
      onClick={handleClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color: "#F97316",
        backgroundColor: "#FFF7ED",
        border: "1px solid #FFEDD5",
        borderRadius: 20,
        padding: "6px 14px",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FFEDD5";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FFF7ED";
      }}
      aria-label="Save this chart to Custom Insights canvas"
    >
      <span>＋</span>
      <span>Save to Insights</span>
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
        marginBottom: 20,
        animation: "chatFadeUp 0.18s ease",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
          color: "#FFFFFF",
          fontWeight: 500,
          borderRadius: "20px 20px 4px 20px",
          padding: "12px 18px",
          maxWidth: "80%",
          fontSize: 14,
          lineHeight: 1.6,
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
    </div>
  );
}

// ─── Assistant message card ───────────────────────────────────────────────────

function AssistantCard({ message }: { message: ChatMessage }) {
  const [sqlOpen, setSqlOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        marginBottom: 24,
        animation: "chatFadeUp 0.22s ease",
      }}
    >
      {/* AI avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <img
          src="/icon.png"
          alt="AI Assistant"
          style={{
            width: 18,
            height: 18,
            objectFit: "contain",
            filter: "brightness(0) invert(1)",
          }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Error state */}
        {message.isError ? (
          <div
            style={{
              backgroundColor: "#FCE8E8",
              border: "1px solid #F87171",
              borderRadius: 16,
              padding: "12px 16px",
              fontSize: 13,
              color: "#FA5252",
              lineHeight: 1.55,
            }}
          >
            {message.content}
          </div>
        ) : (
          <>
            {/* Text answer summary */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #F1F3F5",
                borderRadius: "4px 20px 20px 20px",
                padding: "14px 18px",
                fontSize: 14,
                lineHeight: 1.65,
                color: "#111827",
                wordBreak: "break-word",
                boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04)",
              }}
            >
              {message.content}
            </div>

            {/* SQL Query Accordion */}
            {message.sqlQuery && (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #F1F3F5",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setSqlOpen(!sqlOpen)}
                  style={{
                    width: "100%",
                    padding: "8px 14px",
                    background: "#F8F9FA",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6B7280",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <code>⚡ Generated PostgreSQL Query</code>
                  </span>
                  <span>{sqlOpen ? "▲ Hide" : "▼ View Query"}</span>
                </button>
                {sqlOpen && (
                  <pre
                    style={{
                      margin: 0,
                      padding: "12px 14px",
                      backgroundColor: "#090D16",
                      color: "#34D399",
                      fontSize: 12,
                      fontFamily: "monospace",
                      overflowX: "auto",
                      lineHeight: 1.5,
                    }}
                  >
                    {message.sqlQuery}
                  </pre>
                )}
              </div>
            )}

            {/* Insights list */}
            {message.insights && message.insights.length > 0 && (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #F1F3F5",
                  borderRadius: 16,
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Key Data Insights
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {message.insights.map((item, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.5 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Embedded ECharts Visualization */}
            {message.visualization && (
              <ChartRenderer
                config={message.visualization.config}
                data={message.visualization.data}
              />
            )}

            {/* Save to Insights action */}
            {message.visualization && (
              <div style={{ marginTop: 2 }}>
                <SaveToInsightsButton
                  messageId={message.id}
                  visualization={{
                    ...message.visualization,
                    sqlQuery: message.sqlQuery || message.visualization.sqlQuery,
                  }}
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
  onAddToDashboard?: (visualization: VisualizationPayload) => void;
}

export default function ChatMessageItem({ message }: ChatMessageProps) {
  return (
    <>
      {message.role === "user" ? (
        <UserBubble message={message} />
      ) : (
        <AssistantCard message={message} />
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

