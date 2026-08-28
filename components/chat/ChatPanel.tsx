"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { WeatherDashboardData } from "@/lib/data/weather/weatherTypes";
import type { ChatMessage, VisualizationPayload } from "@/lib/ai/chatTypes";
import { getMockResponse } from "@/lib/ai/mockEngine";
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
  data: WeatherDashboardData | null;
  locationName: string;
  onAddToDashboard: (visualization: VisualizationPayload) => void;
}

/**
 * AI Chat side panel.
 *
 * Manages conversation state. On each send:
 *   1. Adds user message
 *   2. Shows typing indicator (simulated delay 0.8–2s)
 *   3. Runs getMockResponse(question, data) → adds assistant message
 *
 * The panel slides in from the right as a fixed sidebar.
 * Main content adjusts via paddingRight on the parent.
 */
export default function ChatPanel({
  isOpen,
  onClose,
  data,
  locationName,
  onAddToDashboard,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or typing indicator
  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isThinking]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isThinking) return;

      // Add user message
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsThinking(true);

      // Simulate AI latency: 800ms–2000ms
      await new Promise((res) =>
        setTimeout(res, 800 + Math.random() * 1200)
      );

      // Build response
      let payload;
      if (!data) {
        payload = {
          content:
            "Weather data isn't loaded yet. Please wait for the dashboard to finish loading and try again.",
          isError: false,
        };
      } else {
        try {
          payload = getMockResponse(text, data);
        } catch {
          payload = {
            content:
              "Something went wrong generating that response. Please try again.",
            isError: true,
          };
        }
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        timestamp: Date.now(),
        ...payload,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
    },
    [isThinking, data]
  );

  const handleClear = useCallback(() => {
    setMessages([]);
    setIsThinking(false);
  }, []);

  const messageCount = messages.length;

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
                color: "var(--accent)",
                background: `rgba(59,130,246,0.08)`,
                border: "1px solid rgba(59,130,246,0.18)",
                borderRadius: 4,
                padding: "1px 5px",
              }}
            >
              AI
            </span>
          </div>
          <p
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              marginTop: 1,
            }}
          >
            {locationName ? `${locationName} · ` : ""}Mock mode
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
