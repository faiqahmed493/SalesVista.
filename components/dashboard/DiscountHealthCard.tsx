'use client';

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { DataRecord } from '@/lib/visualization/types';

interface MonthlyRecord {
  month: string;
  sales: string | number;
  profit: string | number;
  [key: string]: unknown;
}

interface DiscountHealthCardProps {
  averageDiscount?: number;
  monthlyTrend?: DataRecord[];
  totalSales?: number;
  totalProfit?: number;
}

export default function DiscountHealthCard({
  averageDiscount = 0.1561,
  monthlyTrend = [],
  totalSales = 2300004.46,
  totalProfit = 297032.99,
}: DiscountHealthCardProps) {
  const discountPct = (averageDiscount * 100).toFixed(1);
  const profitMarginPct = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : '0.0';

  // Determine health indicator
  const healthStatus = useMemo(() => {
    const rate = averageDiscount * 100;
    if (rate <= 12) return { label: 'Healthy', color: '#10B981', bg: '#ECFDF5' };
    if (rate <= 18) return { label: 'Moderate', color: '#F59E0B', bg: '#FFFBEB' };
    return { label: 'High Risk', color: '#EF4444', bg: '#FEF2F2' };
  }, [averageDiscount]);

  // Mini sparkline option (recent 12-month margin or sales performance)
  const sparklineOption = useMemo<EChartsOption>(() => {
    // Take last 12 points or fallback array
    const recent = monthlyTrend.length > 0 ? monthlyTrend.slice(-12) : [];
    const values = recent.map((item) => Number(item.profit) || 0);
    const labels = recent.map((item) => item.month);

    return {
      grid: {
        top: 8,
        bottom: 8,
        left: 0,
        right: 0,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#FFFFFF',
        borderColor: '#F1F3F5',
        borderWidth: 1,
        textStyle: { color: '#111827', fontSize: 11 },
        extraCssText: 'box-shadow: 0 4px 20px -2px rgba(0,0,0,0.08); border-radius: 8px;',
        formatter: (params: any) => {
          if (!params?.[0]) return '';
          const p = params[0];
          return `<strong>${p.name}</strong><br/>Profit: $${Number(p.value).toLocaleString()}`;
        },
      },
      xAxis: {
        type: 'category',
        show: false,
        data: labels,
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      series: [
        {
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: values.length > 0 ? values : [2800, 3200, 4100, 3900, 5200, 4800, 6100],
          lineStyle: {
            color: '#6366F1',
            width: 2.5,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(99, 102, 241, 0.28)' },
                { offset: 1, color: 'rgba(99, 102, 241, 0.0)' },
              ],
            },
          },
        },
      ],
    };
  }, [monthlyTrend]);

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
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pricing Health
          </span>
          <h3 style={{ margin: '2px 0 0 0', fontSize: 16, fontWeight: 700, color: '#111827' }}>
            Discount & Yield
          </h3>
        </div>

        {/* Health status badge */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 16,
            color: healthStatus.color,
            backgroundColor: healthStatus.bg,
          }}
        >
          {healthStatus.label}
        </span>
      </div>

      {/* Main KPI Stats */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
            {discountPct}%
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: 500 }}>
            Avg. Order Discount
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#059669', lineHeight: 1 }}>
            {profitMarginPct}%
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: 500 }}>
            Net Margin
          </div>
        </div>
      </div>

      {/* Area Sparkline Chart */}
      <div style={{ height: 75, width: '100%', margin: '-4px 0' }}>
        <ReactECharts
          option={sparklineOption}
          notMerge={true}
          lazyUpdate={true}
          opts={{ renderer: 'canvas' }}
          style={{ height: '100%', width: '100%' }}
        />
      </div>

      {/* Breakdown Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          paddingTop: 14,
          borderTop: '1px solid #F3F4F6',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>Total Revenue</span>
          <strong style={{ fontSize: 14, color: '#111827', fontWeight: 700 }}>
            ${(totalSales / 1_000_000).toFixed(2)}M
          </strong>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'right' }}>
          <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>Net Profit</span>
          <strong style={{ fontSize: 14, color: '#111827', fontWeight: 700 }}>
            ${(totalProfit / 1_000).toFixed(1)}k
          </strong>
        </div>
      </div>
    </div>
  );
}