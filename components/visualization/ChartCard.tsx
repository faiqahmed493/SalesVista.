'use client';

import React from 'react';
import { ThemeColors } from '@/lib/visualization/theme';

interface ChartCardProps {
  title: string;
  description?: string;
  theme: ThemeColors;
  onRemove?: () => void;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  theme,
  onRemove,
  children,
}) => {
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
      {/* Header with Title & Dismiss Button */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: theme.textPrimary }}>
            {title}
          </h3>
          {description && (
            <p style={{ margin: '2px 0 0', fontSize: 11, color: theme.textSecondary, fontFamily: 'cursive' }}>
              {description}
            </p>
          )}
        </div>

        {onRemove && (
          <button
            onClick={onRemove}
            aria-label="Remove chart"
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

      {/* Visual Workspace */}
      <div style={{ padding: '12px 16px 16px', position: 'relative', flex: 1, width: '100%', minWidth: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
};
