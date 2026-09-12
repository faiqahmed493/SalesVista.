// 'use client';

// import React, { useMemo } from 'react';
// import ReactECharts from 'echarts-for-react';
// import type { EChartsOption } from 'echarts';
// import type { DataRecord } from '@/lib/visualization/types';

// interface ProfitLossChartProps {
//   data?: DataRecord[];
//   height?: number;
// }

// export default function ProfitLossChart({ height = 360 }: ProfitLossChartProps) {
//   const chartOption = useMemo<EChartsOption>(() => {
//     const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
//     const lossValues = [6800, 4800, 3800, 5800, 2800, 4900, 2900];
//     const profitValues = [3989, 2100, 1600, 3989, 1800, 2600, 1400];
//     const activeIdx = 3;

//     return {
//       grid: {
//         top: 36,
//         left: 20,
//         right: 20,
//         bottom: 24,
//         containLabel: true,
//       },
//       tooltip: {
//         trigger: 'axis',
//         axisPointer: { type: 'none' },
//         backgroundColor: '#FFFFFF',
//         borderColor: '#F1F3F5',
//         borderWidth: 1,
//         textStyle: { color: '#111827', fontSize: 12 },
//         extraCssText: 'box-shadow: 0 8px 30px -4px rgba(0, 0, 0, 0.12); border-radius: 12px; padding: 12px 16px;',
//         formatter: (params: unknown) => {
//           if (!Array.isArray(params) || !params.length) return '';
//           const labelName = params[0].axisValue;
//           let html = `<div style="font-weight:600;margin-bottom:6px;color:#4B5563;font-size:11px;">Thursday, 18 Sep 2025 (${labelName})</div>`;
//           params.forEach((p) => {
//             const point = p as any;
//             const color = point.seriesIndex === 0 ? '#F97316' : '#06B6D4';
//             html += `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:3px;font-size:12px;">
//               <span style="display:flex;align-items:center;gap:6px;">
//                 <span style="width:8px;height:8px;border-radius:50%;background-color:${color};"></span>
//                 <span style="color:#6B7280;">${point.seriesName}</span>
//               </span>
//               <strong style="color:#111827;font-weight:700;">$${Number(point.value).toLocaleString()}</strong>
//             </div>`;
//           });
//           return html;
//         },
//       },
//       legend: {
//         show: false,
//       },
//       xAxis: {
//         type: 'category',
//         data: categories,
//         axisLine: { show: false },
//         axisTick: { show: false },
//         axisLabel: {
//           color: '#9CA3AF',
//           fontSize: 12,
//           fontWeight: 500,
//           margin: 14,
//         },
//       },
//       yAxis: {
//         type: 'value',
//         min: 0,
//         max: 8000,
//         interval: 1000,
//         splitLine: {
//           lineStyle: {
//             color: '#F1F3F5',
//             type: 'dashed',
//           },
//         },
//         axisLabel: {
//           color: '#9CA3AF',
//           fontSize: 12,
//           formatter: (val: number) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`,
//         },
//       },
//       series: [
//         {
//           name: 'Loss',
//           type: 'bar',
//           barWidth: 30,
//           barGap: '20%',
//           data: lossValues.map((val, idx) => ({
//             value: val,
//             itemStyle: {
//               color: idx === activeIdx ? '#F97316' : '#E5E7EB',
//               borderRadius: [20, 20, 20, 20],
//             },
//           })),
//         },
//         {
//           name: 'Profit',
//           type: 'bar',
//           barWidth: 30,
//           data: profitValues.map((val, idx) => ({
//             value: val,
//             itemStyle: {
//               color: idx === activeIdx ? '#06B6D4' : '#E5E7EB',
//               borderRadius: [20, 20, 20, 20],
//             },
//           })),
//         },
//       ],
//     };
//   }, []);

//   return (
//     <div
//       style={{
//         backgroundColor: '#FFFFFF',
//         border: '1px solid #F1F3F5',
//         borderRadius: 20,
//         padding: '20px 24px',
//         boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
//         display: 'flex',
//         flexDirection: 'column',
//       }}
//     >
//       {/* Header Row: Title on Left, Legend Dots on Right */}
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//         <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
//           Profit & Loss
//         </h3>

//         {/* Color Legend Dots */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, fontWeight: 500, color: '#4B5563' }}>
//           <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//             <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F97316' }}></span>
//             Loss
//           </span>
//           <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//             <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#06B6D4' }}></span>
//             Profit
//           </span>
//         </div>
//       </div>

//       <ReactECharts
//         option={chartOption}
//         notMerge={true}
//         lazyUpdate={true}
//         opts={{ renderer: 'canvas' }}
//         style={{ height, width: '100%' }}
//       />
//     </div>
//   );
// }
'use client';

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { DataRecord } from '@/lib/visualization/types';

export interface MonthlyRecord {
  month: string;
  sales: string | number;
  profit: string | number;
  [key: string]: unknown;
}

interface ProfitLossChartProps {
  data?: DataRecord[];
  height?: number;
}

export default function ProfitLossChart({ data = [], height = 380 }: ProfitLossChartProps) {
  const chartOption = useMemo<EChartsOption>(() => {
    const categories = data.map((d) => d.month);
    const salesData = data.map((d) => Number(d.sales) || 0);
    const profitData = data.map((d) => Number(d.profit) || 0);

    return {
      grid: {
        top: 40,
        left: 16,
        right: 20,
        bottom: 56,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: { color: '#E2E8F0', width: 1.5, type: 'dashed' },
        },
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: [12, 16],
        extraCssText: 'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); border-radius: 12px;',
        formatter: (params: unknown) => {
          if (!Array.isArray(params) || !params.length) return '';
          
          const monthLabel = params[0].axisValue;
          const salesPoint = params.find((p) => p.seriesName === 'Sales');
          const profitPoint = params.find((p) => p.seriesName === 'Profit / Loss');
          
          const salesVal = Number(salesPoint?.value ?? 0);
          const profitVal = Number(profitPoint?.value ?? 0);
          const margin = salesVal > 0 ? ((profitVal / salesVal) * 100).toFixed(1) : '0.0';
          const isProfit = profitVal >= 0;

          return `
            <div style="font-weight:700;font-size:13px;color:#1F2937;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #F3F4F6;">
              ${monthLabel}
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:20px;font-size:12px;margin-bottom:4px;">
              <span style="color:#6B7280;display:flex;align-items:center;gap:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background-color:#3B82F6;"></span>
                Total Sales
              </span>
              <strong style="color:#111827;">$${salesVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:20px;font-size:12px;margin-bottom:4px;">
              <span style="color:#6B7280;display:flex;align-items:center;gap:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background-color:${isProfit ? '#10B981' : '#F43F5E'};"></span>
                Net ${isProfit ? 'Profit' : 'Loss'}
              </span>
              <strong style="color:${isProfit ? '#059669' : '#E11D48'};">
                ${isProfit ? '+' : '-'}$${Math.abs(profitVal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:20px;font-size:11px;color:#9CA3AF;margin-top:6px;padding-top:4px;border-top:1px dashed #F3F4F6;">
              <span>Margin</span>
              <span style="font-weight:600;color:${isProfit ? '#059669' : '#E11D48'};">${margin}%</span>
            </div>
          `;
        },
      },
      legend: { show: false },
      dataZoom: [
        {
          type: 'inside',
          start: 40,
          end: 100,
        },
        {
          type: 'slider',
          show: true,
          bottom: 8,
          height: 18,
          borderColor: 'transparent',
          backgroundColor: '#F8FAFC',
          fillerColor: 'rgba(59, 130, 246, 0.12)',
          handleStyle: { color: '#3B82F6', borderColor: '#3B82F6' },
          textStyle: { color: '#9CA3AF', fontSize: 10 },
        },
      ],
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: '#E5E7EB' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#6B7280',
          fontSize: 11,
          margin: 10,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Sales',
          nameTextStyle: { color: '#9CA3AF', fontSize: 11, align:'right',padding: [0, 10, 10, 0] },
          splitLine: {
            lineStyle: { color: '#F3F4F6', type: 'dashed' },
          },
          axisLabel: {
            color: '#9CA3AF',
            fontSize: 11,
            formatter: (val: number) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`,
          },
        },
        {
          type: 'value',
          name: 'Profit/Loss',
          nameTextStyle: { color: '#9CA3AF', fontSize: 11, align: 'left', padding: [0, 0, 10, -4] },
          splitLine: { show: false },
          axisLabel: {
            color: '#9CA3AF',
            fontSize: 11,
            formatter: (val: number) => `$${val >= 1000 || val <= -1000 ? `${(val / 1000).toFixed(0)}k` : val}`,
          },
        },
      ],
      series: [
        {
          name: 'Sales',
          type: 'line',
          yAxisIndex: 0,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 2.5, color: '#3B82F6' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.28)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.0)' },
              ],
            },
          },
          data: salesData,
        },
        {
          name: 'Profit / Loss',
          type: 'bar',
          yAxisIndex: 1,
          barMaxWidth: 14,
          data: profitData.map((val) => ({
            value: val,
            itemStyle: {
              color: val >= 0 ? '#10B981' : '#F43F5E',
              borderRadius: val >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4],
            },
          })),
        },
      ],
    };
  }, [data]);

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
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
          Monthly Sales & Profit Trend
        </h3>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, fontWeight: 500, color: '#4B5563' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 8, borderRadius: 2, backgroundColor: '#3B82F6' }}></span>
            Sales
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 8, borderRadius: 2, backgroundColor: '#10B981' }}></span>
            Profit
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 8, borderRadius: 2, backgroundColor: '#F43F5E' }}></span>
            Loss
          </span>
        </div>
      </div>

      <ReactECharts
        option={chartOption}
        notMerge={true}
        lazyUpdate={true}
        opts={{ renderer: 'canvas' }}
        style={{ height, width: '100%' }}
      />
    </div>
  );
}