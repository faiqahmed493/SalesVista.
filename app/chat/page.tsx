'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/lib/ai/chatTypes';
import ChatMessageItem from '@/components/chat/ChatMessage';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ChatInput from '@/components/chat/ChatInput';
import { usePersistedChat } from '@/lib/hooks/usePersistedChat';

const SUGGESTED_QUESTIONS = [
  'What are the top 5 profit generating sub-categories?',
  'Monthly sales trend for Technology vs Furniture',
  'Show sales breakdown by customer segment in a donut chart',
  'Compare total sales and profit by geographic region',
];

export default function ChatPage() {
  const { messages, setMessages, clearMessages, todayDate } = usePersistedChat('main');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText: string) => {
    const textToSend = queryText.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
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
    <div className="chat-page-wrapper">
      {/* Empty conversation welcome state */}
      {messages.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '32px 0 24px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#111827',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}
          >
            AI Analytics Assistant
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#6B7280',
              maxWidth: 480,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Ask plain-English questions to query your PostgreSQL Sales database, generate ECharts visual widgets, and pin custom insights.
          </p>

          {/* Suggested Query Chips */}
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 560 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Suggested Analytics Queries
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
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

      {/* Messages Header & Clear Bar */}
      {messages.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            padding: '10px 16px',
            backgroundColor: '#F9FAFB',
            border: '1px solid #F3F4F6',
            borderRadius: 12,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
              Today's Conversation ({todayDate})
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#6B7280',
                backgroundColor: '#E5E7EB',
                padding: '2px 8px',
                borderRadius: 10,
              }}
            >
              Persisted for 1 day
            </span>
          </div>
          <button
            onClick={clearMessages}
            style={{
              background: 'none',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 500,
              color: '#EF4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE2E2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            🗑️ Clear Chat
          </button>
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

      {/* Fixed/Sticky Responsive Prompt Input Component */}
      <ChatInput
        variant="sticky"
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder="Ask a sales BI question... (e.g., Donut chart of top profit categories)"
      />
    </div>
  );
}
