"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage, VisualizationPayload } from "@/lib/ai/chatTypes";
import type { ChatApiResponse } from "@/lib/ai/llmResponseSchema";
import ChatMessageItem from "@/components/chat/ChatMessage";
import TypingIndicator from "@/components/chat/TypingIndicator";
import SuggestedQuestions from "@/components/chat/SuggestedQuestions";
import ChatInput from "@/components/chat/ChatInput";

const PANEL_WIDTH = 380;

// ─── Icons ────────────────────────────────────────────────────────────────────

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6" /><path d="m10 11 0 6" /><path d="m14 11 0 6" /><path d="M9 6V4h6v2" />
  </svg>
);

// ─── Panel component ──────────────────────────────────────────────────────────

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  locationName?: string;
  onAddToDashboard: (visualization: VisualizationPayload) => void;
}

/**
 * AI Chat side panel.
 *
 * Data flow:
 *   User types message
 *   → POST /api/chat { message, locationId }
 *   → Server fetches weather + calls the selected AI provider
 *   → Returns ChatApiResponse
 *   → ChatPanel renders as ChatMessage with optional ChartRenderer
 *
 * The locationId is passed so the server-side route fetches the correct
 * location's weather data for the AI context.
 */
export default function ChatPanel({
  isOpen,
  onClose,
  locationName = "Sales Intelligence",
  onAddToDashboard,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [mode, setMode] = useState<"live" | "mock" | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or typing indicator
  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isThinking]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isThinking) return;

      // Add user message immediately
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsThinking(true);

      try {
        // Call server-side API route — API key never leaves the server
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim() }),
        });

        const responseBody = (await res.json()) as
          | ChatApiResponse
          | { error?: string; category?: string };
        if (!res.ok) {
          const category =
            "category" in responseBody && responseBody.category
              ? `[${responseBody.category}] `
              : "";
          throw new Error(
            `${category}${"error" in responseBody && responseBody.error
              ? responseBody.error
              : `AI request failed (HTTP ${res.status})`}`
          );
        }

        const apiResponse = responseBody as ChatApiResponse;

        // Track whether the response came from Gemini or explicit mock mode.
        setMode(apiResponse.mode);

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: apiResponse.answer,
          timestamp: Date.now(),
          visualization: apiResponse.visualization
            ? {
                config: apiResponse.visualization.config,
                data: apiResponse.visualization.data,
              }
            : undefined,
          insights: apiResponse.insights,
          canAddToDashboard: apiResponse.canAddToDashboard,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        console.error("[ChatPanel] API error:", err);
        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Unable to reach the AI service. Please check your connection and try again.",
          timestamp: Date.now(),
          isError: true,
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsThinking(false);
      }
    },
    [isThinking]
  );

  const handleClear = useCallback(() => {
    setMessages([]);
    setIsThinking(false);
  }, []);

  const messageCount = messages.length;
  const modeLabel = mode === "live" ? "AI" : mode === "mock" ? "Mock mode" : "Connecting…";

  return (
    <div
      role="complementary"
      aria-label="AI weather assistant"
      style={{
        position: "fixed",
        top: 64, // below sticky header
        right: 0,
        bottom: 0,
        width: PANEL_WIDTH,
        transform: isOpen ? "translateX(0)" : `translateX(${PANEL_WIDTH}px)`,
        transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 35,
        background: "var(--card)",
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      {/* ── Panel header ──────────────────────────────────────────── */}
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--foreground)",
                letterSpacing: "-0.01em",
              }}
            >
              Ask your data
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: mode === "live" ? "var(--accent)" : "var(--muted-foreground)",
                background:
                  mode === "live"
                    ? "rgba(59,130,246,0.08)"
                    : "var(--muted)",
                border:
                  mode === "live"
                    ? "1px solid rgba(59,130,246,0.18)"
                    : "1px solid var(--border)",
                borderRadius: 4,
                padding: "1px 5px",
              }}
            >
              {mode === "live" ? "GPT" : "AI"}
            </span>
          </div>
          <p
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              marginTop: 1,
            }}
          >
            {locationName ? `${locationName} · ` : ""}{modeLabel}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Clear conversation */}
          {messageCount > 0 && !isThinking && (
            <button
              onClick={handleClear}
              title="Clear conversation"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "5px 9px",
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "transparent",
                cursor: "pointer",
                fontSize: 11,
                color: "var(--muted-foreground)",
                transition: "all 0.13s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--destructive, #ef4444)";
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--destructive, #ef4444)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--muted-foreground)";
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--border)";
              }}
              aria-label="Clear conversation"
            >
              <TrashIcon />
              <span>Clear</span>
            </button>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            title="Close AI panel"
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: "1px solid var(--border)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted-foreground)",
              transition: "all 0.13s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--muted)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
            aria-label="Close AI assistant"
          >
            <XIcon />
          </button>
        </div>
      </div>

      {/* ── Message area ──────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 14px 4px",
          display: "flex",
          flexDirection: "column",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border) transparent",
        }}
        aria-live="polite"
        aria-label="Conversation"
      >
        {/* Empty state: suggested questions */}
        {messageCount === 0 && !isThinking && (
          <SuggestedQuestions onSelect={handleSend} />
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            onAddToDashboard={onAddToDashboard}
          />
        ))}

        {/* Typing indicator */}
        {isThinking && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={scrollAnchorRef} style={{ height: 1 }} />
      </div>

      {/* ── Input area ────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0 }}>
        <ChatInput onSend={handleSend} disabled={isThinking} />
      </div>
    </div>
  );
}

// ─── Floating "Ask AI" trigger button ────────────────────────────────────────

interface AskAiButtonProps {
  onClick: () => void;
}

export function AskAiButton({ onClick }: AskAiButtonProps) {
  return (
    <button
      id="ask-ai-trigger"
      onClick={onClick}
      title="Ask AI about your weather data"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 36,
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "10px 18px",
        background: "var(--accent)",
        color: "var(--accent-foreground)",
        border: "none",
        borderRadius: 24,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
        transition: "all 0.2s",
        letterSpacing: "-0.01em",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform =
          "translateY(-2px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 6px 24px rgba(59,130,246,0.45)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "none";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 4px 20px rgba(59,130,246,0.35)";
      }}
      aria-label="Open AI assistant"
    >
      <span style={{ fontSize: 15 }}>✦</span>
      Ask AI
    </button>
  );
}
