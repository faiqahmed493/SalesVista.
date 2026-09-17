'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface TopHeaderProps {
  onMenuClick: () => void;
}

export default function TopHeader({ onMenuClick }: TopHeaderProps) {
  const pathname = usePathname();

  let pageTitle = 'Overview Dashboard';
  if (pathname.startsWith('/chat')) {
    pageTitle = 'AI Analytics Assistant';
  } else if (pathname.startsWith('/insights')) {
    pageTitle = 'Custom Insights';
  }

  return (
    <header
      className="top-header"
      style={{
        height: 60,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #F1F3F5',
        display: 'flex',
        alignItems: 'center',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        width: '100%',
      }}
    >
      <button
        className="mobile-menu-button"
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#4B5563',
          cursor: 'pointer',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 6,
          marginRight: 8,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>
      {/* Dynamic Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        <span style={{ color: '#9CA3AF', fontWeight: 500 }}>Pages</span>
        <span style={{ color: '#D1D5DB' }}>/</span>
        <span style={{ color: '#111827', fontWeight: 600 }}>{pageTitle}</span>
      </div>
    </header>
  );
}
