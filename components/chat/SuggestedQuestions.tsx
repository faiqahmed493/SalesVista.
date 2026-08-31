"use client";

import React from "react";
import { SUGGESTED_QUESTIONS } from "@/lib/ai/chatTypes";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

/**
 * Shown in the empty chat state.
 * A welcome message + clickable question chips that seed the conversation.
 */
export default function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 12px 16px",
        gap: 20,
      }}
    >
      {/* Welcome icon + copy */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "var(--muted)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            margin: "0 auto 12px",
          }}
        >
          ✦
        </div>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--foreground)",
            marginBottom: 4,
          }}
        >
          Ask your weather data
        </p>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
          Get instant insights, charts, and forecasts in plain language.
        </p>
      </div>

      {/* Question chips */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 7,
          width: "100%",
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
            marginBottom: 2,
          }}
        >
          Try asking
        </p>
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "9px 13px",
              background: "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontSize: 12,
              color: "var(--foreground)",
              cursor: "pointer",
              lineHeight: 1.4,
              transition: "all 0.14s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "var(--accent)";
              el.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "var(--border)";
              el.style.color = "var(--foreground)";
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
