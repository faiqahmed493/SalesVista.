'use client';

import React from 'react';
import { ThemeColors } from '@/lib/visualization/theme';

interface ChartCardProps {
  title: string;
  description?: string;
  theme: ThemeColors;
  onRemove?: () => void;
  lastRefreshed?: Date | null;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  theme,
  onRemove,
  lastRefreshed,
  children,
}) => {
  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        boxShadow: theme.shadow,
        overflow: 'hidden',
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Header with Title & Action Controls */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: theme.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </h3>
          {description && (
            <p style={{ margin: '2px 0 0', fontSize: 11, color: theme.textSecondary }}>
              {description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {lastRefreshed && (
            <span style={{ fontSize: 11, color: theme.textSecondary, whiteSpace: 'nowrap' }}>
              Updated {formatTime(lastRefreshed)}
            </span>
          )}

          {onRemove && (
            <button
              onClick={onRemove}
              aria-label="Remove chart"
              title="Remove chart from insights canvas"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: theme.textSecondary,
                padding: '4px 6px',
                borderRadius: 6,
                lineHeight: 1,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.textSecondary)}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Visual Workspace */}
      <div style={{ padding: '12px 16px 16px', position: 'relative', flex: 1, width: '100%', minWidth: 0, overflow: 'hidden' }}>
        {children}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
