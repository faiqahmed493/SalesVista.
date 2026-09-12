'use client';

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { DataRecord } from '@/lib/visualization/types';

export interface CategorySalesRecord {
  category: string;
  sales: string | number;
  profit?: string | number;
  [key: string]: unknown;
}

interface CategoryDonutChartProps {
  data?: DataRecord[];
  totalSales?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Technology: '#6366F1',       // Indigo
  Furniture: '#F59E0B',        // Amber / Orange
  'Office Supplies': '#06B6D4',// Cyan / Teal
};

// Fallback palette if unexpected categories are returned
const FALLBACK_PALETTE = ['#6366F1', '#F59E0B', '#06B6D4', '#10B981', '#EC4899'];

export default function CategoryDonutChart({
  data = [],
  totalSales = 0,
}: CategoryDonutChartProps) {
  // Compute total sales dynamically if not directly provided
  const computedTotal = useMemo(() => {
    if (totalSales > 0) return totalSales;
    return data.reduce((acc, item) => acc + (Number(item.sales) || 0), 0);
  }, [data, totalSales]);

  // Transform data records for ECharts pie series
  const chartData = useMemo(() => {
    return data.map((item, idx) => {
      const color =
        CATEGORY_COLORS[item.category] ||
        FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];

      return {
        name: item.category,
        value: Number(item.sales) || 0,
        profit: Number(item.profit) || 0,
        itemStyle: { color },
      };
    });
  }, [data]);

  // Format large numbers cleanly for center label ($2.30M / $500k)
  const formattedCenterValue = useMemo(() => {
    if (computedTotal >= 1_000_000) {
      return `$${(computedTotal / 1_000_000).toFixed(2)}M`;
    }
    if (computedTotal >= 1_000) {
      return `$${(computedTotal / 1_000).toFixed(1)}k`;
    }
    return `$${Math.round(computedTotal).toLocaleString()}`;
  }, [computedTotal]);

  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        backgroundColor: '#FFFFFF',
        borderColor: '#F1F3F5',
        borderWidth: 1,
        textStyle: { color: '#111827', fontSize: 12 },
        extraCssText:
          'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); border-radius: 12px; padding: 12px 16px;',
        formatter: (params: any) => {
          const item = params.data;
          const salesVal = Number(item.value || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          const profitVal = Number(item.profit || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          return `
            <div style="font-weight:700;font-size:13px;color:#111827;margin-bottom:6px;">
              ${params.name}
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:12px;margin-bottom:3px;">
              <span style="color:#6B7280;display:flex;align-items:center;gap:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background-color:${params.color};"></span>
                Sales
              </span>
              <strong style="color:#111827;">$${salesVal} (${params.percent}%)</strong>
            </div>
            ${
              item.profit !== undefined
                ? `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:12px;">
                    <span style="color:#6B7280;display:flex;align-items:center;gap:6px;">
                      <span style="width:8px;height:8px;border-radius:50%;background-color:#10B981;"></span>
                      Profit
                    </span>
                    <strong style="color:#059669;">$${profitVal}</strong>
                  </div>`
                : ''
            }
          `;
        },
      },
      legend: {
        bottom: 0,
        left: 'center',
        icon: 'roundRect',
        itemWidth: 12,
        itemHeight: 8,
        padding: 0,
        itemGap: 12,
        textStyle: {
          color: '#4B5563',
          fontSize: 12,
          fontWeight: 500,
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['60%', '84%'],
          center: ['50%', '50%'],
          startAngle: 90,
          avoidLabelOverlap: false,
          itemStyle: {
            borderColor: '#FFFFFF',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'center',
            formatter: () => `{label|Total Sales}\n{val|${formattedCenterValue}}`,
            rich: {
              label: {
                fontSize: 12,
                color: '#9CA3AF',
                fontWeight: 500,
                lineHeight: 20,
              },
              val: {
                fontSize: 22,
                color: '#111827',
                fontWeight: 700,
                lineHeight: 30,
              },
            },
          },
          emphasis: {
            scaleSize: 5,
          },
          data: chartData,
        },
      ],
    }),
    [chartData, formattedCenterValue]
  );

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #F1F3F5',
        borderRadius: 20,
        // minHeight: 360,
        padding: '16px 24px',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
          Sales by Category
        </h3>
        
      </div>

      <ReactECharts
        option={option}
        notMerge={true}
        lazyUpdate={true}
        opts={{ renderer: 'canvas' }}
        style={{ height: 240, width: '100%'}}
      />
    </div>
  );
}