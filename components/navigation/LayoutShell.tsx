'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import TopHeader from '@/components/navigation/TopHeader';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="app-content" style={{ flex: 1, marginLeft: 220, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
