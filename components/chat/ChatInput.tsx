"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  suggestions?: string[];
  variant?: "embedded" | "sticky";
}

const SendIcon = () => (
  <svg
    width="16"
    height="16"
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

const ClearIcon = () => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SparklesIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#F97316"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

/**
 * Mobile-responsive Chat Input component with:
 *   - Auto-growing, responsive textarea (16px font on mobile to prevent iOS Safari auto-zoom)
 *   - Keyboard support (Enter to send, Shift+Enter for newline)
 *   - Touch target buttons (≥36px/40px touch targets)
 *   - Quick clear button when text is entered
 *   - Optional horizontal mobile prompt chips
 *   - Character counter and visual focus states
 */
export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Ask plain-English sales BI questions...",
  suggestions = [],
  variant = "embedded",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const maxHeight = window.innerWidth <= 768 ? 110 : 140;
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

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

  const handleClear = () => {
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  const handleSuggestionClick = (chipText: string) => {
    onSend(chipText);
  };

  const canSend = value.trim().length > 0 && !disabled;

  if (variant === "sticky") {
    return (
      <div className="chat-input-sticky-wrapper">
        {/* Horizontal prompt chips on mobile */}
        {suggestions.length > 0 && (
          <div className="chat-mobile-chips-scroll">
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(chip)}
                disabled={disabled}
                style={{
                  whiteSpace: "nowrap",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: 16,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#374151",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#FFEDD5";
                  e.currentTarget.style.color = "#F97316";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.color = "#374151";
                }}
              >
                <SparklesIcon />
                <span>{chip}</span>
              </button>
            ))}
          </div>
        )}

        <form
          className="chat-input-card"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              width: "100%",
            }}
          >
            <textarea
              ref={textareaRef}
              id="chat-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "AI is thinking..." : placeholder}
              disabled={disabled}
              rows={1}
              maxLength={1000}
              className="chat-textarea"
              aria-label="Sales BI query input"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSend}
              title={canSend ? "Send query (Enter)" : "Type a query to send"}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "none",
                backgroundColor: canSend ? "#F97316" : "#E5E7EB",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canSend ? "pointer" : "not-allowed",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}
              aria-label="Send query"
            >
              <SendIcon />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 2,
            }}
          >
            {value.length > 200 && (
              <span style={{ fontSize: 10, color: value.length > 850 ? "#EF4444" : "#9CA3AF" }}>
                {value.length}/1000
              </span>
            )}
          </div>
        </form>
      </div>
    );
  }

  // Embedded variant (used in ChatPanel drawer or inline sections)
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
          (e.currentTarget as HTMLDivElement).style.borderColor = "#F97316";
        }}
        onBlurCapture={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        }}
      >
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "AI is thinking..." : placeholder}
          disabled={disabled}
          rows={1}
          maxLength={1000}
          className="chat-textarea"
          aria-label="Sales BI query input"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          title={canSend ? "Send (Enter)" : "Type a message to send"}
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: "none",
            background: canSend ? "#F97316" : "var(--border)",
            color: canSend ? "#FFFFFF" : "var(--muted-foreground)",
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {value.length > 200 && (
          <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
            {value.length}/1000
          </span>
        )}
      </div>
    </div>
  );
}
