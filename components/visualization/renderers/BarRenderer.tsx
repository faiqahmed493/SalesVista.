'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { SubRendererProps } from './types';
import { getBaseEChartsOption, DEFAULT_COLOR_PALETTE } from '@/lib/visualization/theme';

export const BarRenderer: React.FC<SubRendererProps> = ({ config, data, series, theme, isDark, height }) => {
  const base = getBaseEChartsOption(theme, isDark);
  const categories = data.map((d) => String(d[config.xKey] ?? ''));

  const showLegend = config.legend ?? series.length > 1;

  const option: EChartsOption = {
    ...base,
    grid: {
      top: showLegend ? 36 : 24,
      left: 16,
      right: 24,
      bottom: 36,
      containLabel: true,
    },
    tooltip: { ...base.tooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      show: showLegend,
      top: 0,
      left: 'center',
      itemGap: 20,
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 8,
      textStyle: { color: theme.textSecondary, fontSize: 11 },
    },
    xAxis: {
      type: 'category',
      data: categories,
      show: !(config.xAxis?.hide ?? false),
      axisLine: { lineStyle: { color: theme.axisLine } },
      axisLabel: {
        color: theme.textSecondary,
        fontSize: 10.5,
        margin: 10,
        interval: 0, // Always show every single label under every bar
        rotate: 0,   // Horizontal text only (no rotation)
        hideOverlap: false,
        formatter: (val: string) => {
          if (val.length > 10 && val.includes(' ')) {
            return val.split(' ').join('\n');
          }
          return val;
        },
      },
    },
    yAxis: {
      type: 'value',
      show: !(config.yAxis?.hide ?? false),
      splitLine: { lineStyle: { color: theme.splitLine, type: 'dashed' } },
      axisLabel: { color: theme.textSecondary, fontSize: 11, formatter: `{value}${config.unit ?? ''}` },
    },
    series: series.map((s) => {
      const isSingleSeriesMultiCategory = series.length === 1 && data.length > 1;

      return {
        name: s.label,
        type: 'bar' as const,
        stack: config.stacked ? (s.stackId ?? 'total') : undefined,
        data: data.map((d, idx) => {
          const val = Number(d[s.key] ?? 0);
          if (isSingleSeriesMultiCategory) {
            // Assign distinct color per category bar
            const barColor = DEFAULT_COLOR_PALETTE[idx % DEFAULT_COLOR_PALETTE.length];
            return {
              value: val,
              itemStyle: { color: barColor, borderRadius: [4, 4, 0, 0] },
            };
          }
          return val;
        }),
        itemStyle: { color: s.resolvedColor, borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 36,
      };
    }),
  };

  return (
    <ReactECharts
      option={option}
      notMerge={true}
      lazyUpdate={true}
      opts={{ renderer: 'canvas' }}
      style={{ height, width: '100%' }}
    />
  );
};
