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
      {/* AI avatar container with real LLM gradient pending animation */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          animation: "llmAvatarBreath 1.8s ease-in-out infinite",
          boxShadow: "0 0 12px rgba(249, 115, 22, 0.45)",
          overflow: "hidden",
        }}
      >
        <img
          src="/icon.png"
          alt="AI Pending"
          style={{
            width: 22,
            height: 22,
            objectFit: "contain",
            filter: "brightness(0) invert(1)",
            animation: "llmIconSpinPulse 2.4s ease-in-out infinite",
          }}
        />
      </div>

      {/* Bubble with bouncing dots and status text */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #FFEDD5",
          borderRadius: "16px 16px 16px 4px",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 4px 16px rgba(249, 115, 22, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
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
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#6B7280",
            letterSpacing: "-0.01em",
          }}
        >
          Analyzing database & generating query…
        </span>
      </div>

      <style>{`
        @keyframes llmAvatarBreath {
          0% {
            transform: scale(1);
            box-shadow: 0 0 8px rgba(249, 115, 22, 0.35);
          }
          50% {
            transform: scale(1.12);
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.7);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 8px rgba(249, 115, 22, 0.35);
          }
        }

        @keyframes llmIconSpinPulse {
          0% {
            transform: rotate(0deg) scale(1);
            opacity: 0.9;
          }
          50% {
            transform: rotate(180deg) scale(1.15);
            opacity: 1;
          }
          100% {
            transform: rotate(360deg) scale(1);
            opacity: 0.9;
          }
        }

        @keyframes typingBounce {
          0%, 55%, 100% { transform: translateY(0); opacity: 0.35; }
          27% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
