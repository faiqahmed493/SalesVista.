'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import TopHeader from '@/components/navigation/TopHeader';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/signup';

  if (isAuthPage) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#F8F9FA', margin: 0, padding: 0 }}>
        {children}
      </main>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 220, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopHeader />
        <main style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
