'use client';

import React, { useState, useEffect } from 'react';
import type { SalesDashboardData } from '@/lib/data/sales/salesService';
import StatCard from './StatCard';
import ProfitLossChart from './ProfitLossChart';
import CategoryDonutChart from './CategoryDonutChart';
import DiscountHealthCard from './DiscountHealthCard';
import {
  KpiCardSkeleton,
  ProfitLossChartSkeleton,
  CategoryDonutSkeleton,
  DiscountHealthSkeleton,
} from '@/components/ui/Skeleton';

interface DashboardContainerProps {
  initialData: SalesDashboardData | null;
}

export default function DashboardContainer({ initialData }: DashboardContainerProps) {
  const [data, setData] = useState<SalesDashboardData | null>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);

  console.log("data",data)

  useEffect(() => {
    let isMounted = true;
    if (!initialData) {
      fetch('/api/sales')
        .then((res) => res.json())
        .then((result) => {
          if (isMounted && result.success) {
            setData(result.data);
          }
          if (isMounted) setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch sales dashboard data:', err);
          if (isMounted) setIsLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [initialData]);

  const kpis = data?.kpis;
  console.log("hhhg",kpis)
  
  return (
    <div style={{ padding: '24px 16px 48px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Parent 2-Column Grid (Left ~68% [8fr], Right ~32% [4fr]) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 8fr) minmax(0, 4fr)',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* Left Parent Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Row 1 (Top): 3 KPI Cards Subgrid */}
          {isLoading && !data ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <KpiCardSkeleton />
              <KpiCardSkeleton />
              <KpiCardSkeleton />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {/* 1. Total Sales Card */}
              <StatCard
                title="Total Sales"
                metric={kpis ? `$${Math.round(kpis.totalSales).toLocaleString()}` : '$0'}
                isPositive={false}
                iconBgColor="#FFF7ED"
                iconColor="#F97316"
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                }
              />

              {/* 2. Total Customers Card */}
              <StatCard
                title="Total Profit"
                metric={kpis ? `$${Math.round(kpis.totalProfit).toLocaleString()}` : '$0'}
                isPositive={true}
                iconBgColor="#FFF7ED"
                iconColor="#F97316"
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                }
              />

              {/* 3. Total Transactions Card */}
              <StatCard
                title="Total Orders"
                metric={kpis ? `${kpis.totalOrders.toLocaleString()}` : '$0'}
                isPositive={false}
                iconBgColor="#FFF7ED"
                iconColor="#F97316"
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                }
              />
            </div>
          )}

          {/* Row 2 (Bottom): Profit & Loss Chart */}
          {isLoading && !data ? (
            <ProfitLossChartSkeleton height={380} />
          ) : (
            <ProfitLossChart data={data?.monthlySalesTrend || []} height={380} />
          )}
        </div>

        {/* Right Parent Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {isLoading && !data ? (
            <>
              <CategoryDonutSkeleton />
              <DiscountHealthSkeleton />
            </>
          ) : (
            <>
              {/* Top Card: Order Info (Aligns horizontally with 3 KPI Cards) */}
              <CategoryDonutChart
                data={data?.salesByCategory || []}
                totalSales={data?.kpis?.totalSales || 0}
              />

              {/* Bottom Card: Sales Performance Ticker */}
              <DiscountHealthCard
                averageDiscount={data?.kpis?.averageDiscount}
                monthlyTrend={data?.monthlySalesTrend}
                totalSales={data?.kpis?.totalSales}
                totalProfit={data?.kpis?.totalProfit}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
