'use client';

import React from 'react';

interface SalesVistaLogoProps {
  fontSize?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SalesVista Clean Typography Logo Component (No Icon Badge)
 */
export function SalesVistaLogo({
  fontSize = 22,
  className = '',
  style,
}: SalesVistaLogoProps) {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 1,
        userSelect: 'none',
        ...style,
      }}
    >
      <span
        style={{
          fontSize,
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '-0.035em',
          fontFamily: 'var(--font-inter), system-ui, -apple-system, sans-serif',
        }}
      >
        Sales
      </span>
      <span
        style={{
          fontSize,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.035em',
          fontFamily: 'var(--font-inter), system-ui, -apple-system, sans-serif',
        }}
      >
        Vista
      </span>
      <span
        style={{
          fontSize: fontSize * 0.9,
          fontWeight: 900,
          color: '#F97316',
          marginLeft: '1px',
        }}
      >
        .
      </span>
    </div>
  );
}

export default SalesVistaLogo;
