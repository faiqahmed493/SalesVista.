"use client";

import React from "react";

/**
 * Animated typing indicator shown while the AI is "thinking".
 * Three dots that bounce in sequence, styled with CSS variables.
 */
export default function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "4px 0 8px",
      }}
      aria-label="AI is thinking…"
      role="status"
    >
      {/* AI avatar dot */}
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
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        ✦
      </div>

      {/* Bubble with bouncing dots */}
      <div
        style={{
          background: "var(--muted)",
          border: "1px solid var(--border)",
          borderRadius: "16px 16px 16px 4px",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--muted-foreground)",
              animation: `typingBounce 1.2s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 55%, 100% { transform: translateY(0); opacity: 0.35; }
          27% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
