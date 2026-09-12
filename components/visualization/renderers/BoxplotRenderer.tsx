'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { SubRendererProps } from './types';
import { getBaseEChartsOption } from '@/lib/visualization/theme';

export const BoxplotRenderer: React.FC<SubRendererProps> = ({ config, data, series, theme, isDark, height }) => {
  const base = getBaseEChartsOption(theme, isDark);
  const categories = data.map((d) => String(d[config.xKey] ?? ''));
  const valueKey = series[0]?.key ?? '';

  const boxplotData = data.map((d) => {
    const val = d[valueKey];
    if (Array.isArray(val)) {
      return val;
    }
    const num = Number(val ?? 0);
    return [num, num, num, num, num];
  });

  const option: EChartsOption = {
    ...base,
    grid: {
      top: 28,
      left: 16,
      right: 24,
      bottom: 36,
      containLabel: true,
    },
    tooltip: { ...base.tooltip, trigger: 'item' },
    xAxis: {
      type: 'category',
      data: categories,
      show: !(config.xAxis?.hide ?? false),
      axisLine: { lineStyle: { color: theme.axisLine } },
      axisLabel: {
        color: theme.textSecondary,
        fontSize: 11,
        interval: 'auto',
        overflow: 'truncate',
        width: 80,
      },
    },
    yAxis: {
      type: 'value',
      show: !(config.yAxis?.hide ?? false),
      splitLine: { lineStyle: { color: theme.splitLine, type: 'dashed' } },
      axisLabel: { color: theme.textSecondary, fontSize: 11, formatter: `{value}${config.unit ?? ''}` },
    },
    series: [
      {
        name: series[0]?.label ?? 'Distribution',
        type: 'boxplot',
        data: boxplotData,
        itemStyle: {
          color: series[0]?.resolvedColor ?? theme.primary,
          borderColor: series[0]?.resolvedColor ?? theme.primary,
        },
      },
    ],
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
