'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function TopHeader() {
  const pathname = usePathname();

  let pageTitle = 'Overview Dashboard';
  if (pathname.startsWith('/chat')) {
    pageTitle = 'AI Analytics Assistant';
  } else if (pathname.startsWith('/insights')) {
    pageTitle = 'Custom Insights';
  }

  return (
    <header
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
      {/* Dynamic Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        <span style={{ color: '#9CA3AF', fontWeight: 500 }}>Pages</span>
        <span style={{ color: '#D1D5DB' }}>/</span>
        <span style={{ color: '#111827', fontWeight: 600 }}>{pageTitle}</span>
      </div>
    </header>
  );
}
