"use client";

import React, { useRef, useState, useCallback } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const SendIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

/**
 * Chat input box with:
 *   - Auto-growing textarea
 *   - Enter to send
 *   - Shift+Enter for newline
 *   - Send button (disabled when empty or loading)
 *   - Character count softcap hint
 */
export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-grow
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      style={{
        padding: "12px 14px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: "var(--card)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          background: "var(--muted)",
          border: `1px solid var(--border)`,
          borderRadius: 12,
          padding: "8px 8px 8px 12px",
          transition: "border-color 0.15s",
        }}
        onFocusCapture={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
        }}
        onBlurCapture={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        }}
      >
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled ? "AI is thinking…" : "Ask about your weather data…"
          }
          disabled={disabled}
          rows={1}
          maxLength={1000}
          style={{
            flex: 1,
            resize: "none",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--foreground)",
            fontFamily: "inherit",
            minHeight: 22,
            maxHeight: 140,
            overflow: "auto",
            caretColor: "var(--accent)",
          }}
          aria-label="Ask AI about your weather data"
        />

        <button
          onClick={handleSubmit}
          disabled={!canSend}
          title={canSend ? "Send (Enter)" : "Type a message to send"}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "none",
            background: canSend ? "var(--accent)" : "var(--border)",
            color: canSend ? "var(--accent-foreground)" : "var(--muted-foreground)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: canSend ? "pointer" : "not-allowed",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>

      <p
        style={{
          fontSize: 10,
          color: "var(--muted-foreground)",
          textAlign: "center",
          margin: 0,
        }}
      >
        Enter to send · Shift+Enter for newline
      </p>
    </div>
  );
}
