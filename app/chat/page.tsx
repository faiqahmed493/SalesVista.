'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/lib/ai/chatTypes';
import ChatMessageItem from '@/components/chat/ChatMessage';
import TypingIndicator from '@/components/chat/TypingIndicator';

const SUGGESTED_QUESTIONS = [
  'What are the top 5 profit generating sub-categories?',
  'Monthly sales trend for Technology vs Furniture',
  'Show sales breakdown by customer segment in a donut chart',
  'Compare total sales and profit by geographic region',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'Query execution completed.',
        sqlQuery: data.sqlQuery,
        queryData: data.queryData,
        visualization: data.visualization,
        insights: data.insights,
        canAddToDashboard: Boolean(data.canAddToDashboard),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('[ChatPage] Error sending query:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: (err as Error).message || 'Failed to process request.',
        isError: true,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 860,
        margin: '0 auto',
        padding: '24px 20px 140px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 60px)',
      }}
    >
      {/* Empty conversation welcome state */}
      {messages.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '48px 0 32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: 24,
              marginBottom: 16,
              boxShadow: '0 8px 24px rgba(249, 115, 22, 0.25)',
            }}
          >
            ✦
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            AI Analytics Assistant
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 480, margin: 0, lineHeight: 1.6 }}>
            Ask plain-English questions to query your PostgreSQL Sales database, generate ECharts visual widgets, and pin custom insights.
          </p>

          {/* Suggested Query Chips */}
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 560 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Suggested Analytics Queries
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #F1F3F5',
                    borderRadius: 14,
                    padding: '12px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#374151',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FFEDD5';
                    e.currentTarget.style.color = '#F97316';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#F1F3F5';
                    e.currentTarget.style.color = '#374151';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <span>{q}</span>
                  <span style={{ color: '#F97316', fontWeight: 600 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div style={{ flex: 1 }}>
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div style={{ marginBottom: 20 }}>
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Bottom Claude-Style Prompt Input */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: 'calc(240px + (100% - 240px) / 2)',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 280px)',
          maxWidth: 820,
          zIndex: 30,
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 24,
            padding: '10px 14px 10px 20px',
            boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask a sales BI question... (e.g., Donut chart of top profit categories)"
            rows={1}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: 14,
              fontFamily: 'inherit',
              color: '#111827',
              backgroundColor: 'transparent',
              maxHeight: 120,
              lineHeight: 1.5,
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: input.trim() && !isLoading ? '#F97316' : '#E5E7EB',
              color: '#FFFFFF',
              border: 'none',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}
