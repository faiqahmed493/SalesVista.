'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SalesVistaLogo } from '@/components/common/BrandLogo';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email?: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error('Failed to fetch current user:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    router.push('/login');
    router.refresh();
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
        </svg>
      ),
    },
    {
      label: 'AI Assistant',
      href: '/chat',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <path d="M12 7v6"></path>
          <path d="M9 10h6"></path>
        </svg>
      ),
    },
    {
      label: 'Custom Insights',
      href: '/insights',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
    },
  ];

  const displayName = user?.name || 'Loading...';
  const displayInitials = user?.name ? getInitials(user.name) : '..';

  return (
    <aside
      style={{
        width: 220,
        height: '100vh',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #F1F3F5',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <SalesVistaLogo fontSize={24} />
      </div>

      {/* Primary Navigation Links */}
      <nav style={{ padding: '16px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#F97316' : '#4B5563',
                backgroundColor: isActive ? '#FFF7ED' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ color: isActive ? '#F97316' : '#9CA3AF', display: 'flex' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile / Logout at Bottom */}
      <div
        style={{
          padding: '16px 14px',
          borderTop: '1px solid #F1F3F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#FFF7ED',
              border: '1.5px solid #FFEDD5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: '#F97316',
              flexShrink: 0,
            }}
          >
            {displayInitials}
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#111827',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={displayName}
            >
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
              Sales Manager
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#9CA3AF',
            padding: 6,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FA5252';
            e.currentTarget.style.backgroundColor = '#FCE8E8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#9CA3AF';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>
  );
}
