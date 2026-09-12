'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  metric: string;
  subtitle?: string;
  isPositive: boolean;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export default function StatCard({
  title,
  metric,
  subtitle,
  isPositive,
  icon,
  iconBgColor = '#FFF7ED',
  iconColor = '#F97316',
}: StatCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #F1F3F5',
        borderRadius: 20,
        padding: '20px 24px',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Top row: Icon backdrop & Context Dots */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: iconBgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
          }}
        >
          {icon}
        </div>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: '#D1D5DB',
            fontSize: 18,
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: 6,
          }}
        >
          ···
        </button>
      </div>

      {/* Middle row: Label & Metric */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}>
          {title}
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#111827',
            letterSpacing: '-0.02em',
            marginTop: 4,
          }}
        >
          {metric}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
     
    </div>
  );
}
