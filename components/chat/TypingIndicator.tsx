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
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          color: "#FFFFFF",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(249, 115, 22, 0.25)",
        }}
      >
        ✦
      </div>

      {/* Bubble with bouncing dots */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "16px 16px 16px 4px",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.05)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#F97316",
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
