'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useSavedInsights, deduplicateVisualizations } from '@/lib/context/SavedInsightsContext';
import { SavedInsightCard, SavedInsightCardRef } from '@/components/visualization/SavedInsightCard';

export default function InsightsPage() {
  const { savedVisualizations, removeVisualization } = useSavedInsights();
  const uniqueVisualizations = deduplicateVisualizations(savedVisualizations);

  const cardRefs = useRef<Map<string, SavedInsightCardRef>>(new Map());
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  const handleRefreshAll = async () => {
    if (isRefreshingAll || uniqueVisualizations.length === 0) return;
    setIsRefreshingAll(true);
    try {
      const promises: Promise<void>[] = [];
      cardRefs.current.forEach((ref) => {
        if (ref && ref.refresh) {
          promises.push(ref.refresh());
        }
      });
      await Promise.allSettled(promises);
    } finally {
      setIsRefreshingAll(false);
    }
  };

  return (
    <div style={{ padding: '24px 28px 48px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Page Description Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
            Custom Insights Canvas
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
            Visual widgets pinned directly from your AI Analytics Assistant queries.
          </p>
        </div>
        {uniqueVisualizations.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshingAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                padding: '8px 16px',
                cursor: isRefreshingAll ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isRefreshingAll) {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.color = '#111827';
                }
              }}
              onMouseLeave={(e) => {
                if (!isRefreshingAll) {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.color = '#374151';
                }
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  animation: isRefreshingAll ? 'spin 0.8s linear infinite' : 'none',
                  flexShrink: 0,
                }}
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6" />
                <path d="M2 11.5a10 10 0 0 1 18.8-4.3L21.5 8M2.5 16l1.2 1.2A10 10 0 0 0 22 12.5" />
              </svg>
              <span>{isRefreshingAll ? 'Refreshing…' : 'Refresh'}</span>
            </button>
            <Link
              href="/chat"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: '#F97316',
                backgroundColor: '#FFF7ED',
                border: '1px solid #FFEDD5',
                borderRadius: 12,
                padding: '8px 16px',
                textDecoration: 'none',
              }}
            >
              <span>＋ Pin More Charts</span>
            </Link>
          </div>
        )}
      </div>

      {/* Empty State */}
      {uniqueVisualizations.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #F1F3F5',
            borderRadius: 20,
            padding: '64px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
            maxWidth: 580,
            margin: '60px auto 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#FFF7ED',
              border: '1px solid #FFEDD5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              color: '#F97316',
              marginBottom: 18,
            }}
          >
            📊
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
            No custom visuals pinned yet
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 24px', lineHeight: 1.6, maxWidth: 420 }}>
            Generate custom data visualizations in the AI Analytics Assistant and click &quot;Save to Insights&quot; to pin them here.
          </p>
          <Link
            href="/chat"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              color: '#FFFFFF',
              backgroundColor: '#F97316',
              borderRadius: 12,
              padding: '12px 24px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Go to AI Assistant</span>
            <span>→</span>
          </Link>
        </div>
      ) : (
        /* Dynamic Grid of Saved Visual Widgets */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
            gap: 20,
          }}
        >
          {uniqueVisualizations.map((item, index) => {
            const key = `${item.config.type}-${item.config.title.trim().toLowerCase()}-${index}`;
            return (
              <SavedInsightCard
                key={key}
                ref={(el) => {
                  if (el) {
                    cardRefs.current.set(key, el);
                  } else {
                    cardRefs.current.delete(key);
                  }
                }}
                item={item}
                onRemove={() => removeVisualization(item.config.title, item.config.type)}
              />
            );
          })}
        </div>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
