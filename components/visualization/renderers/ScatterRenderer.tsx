'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { SubRendererProps } from './types';
import { getBaseEChartsOption } from '@/lib/visualization/theme';

export const ScatterRenderer: React.FC<SubRendererProps> = ({ config, data, series, theme, isDark, height }) => {
  const base = getBaseEChartsOption(theme, isDark);
  const xKey = config.xKey;
  const yKey = series[0]?.key ?? '';
  const sizeKey = series[1]?.key;

  const points = data.map((d) => [Number(d[xKey] ?? 0), Number(d[yKey] ?? 0), sizeKey ? Number(d[sizeKey] ?? 10) : 10]);

  const option: EChartsOption = {
    ...base,
    grid: {
      top: 28,
      left: 16,
      right: 24,
      bottom: 36,
      containLabel: true,
    },
    tooltip: {
      ...base.tooltip,
      formatter: (p: any) => `${xKey}: ${p.data[0]}<br/>${yKey}: ${p.data[1]}${config.unit ?? ''}`,
    },
    xAxis: {
      type: 'value',
      name: xKey,
      show: !(config.xAxis?.hide ?? false),
      splitLine: { lineStyle: { color: theme.splitLine } },
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
      name: yKey,
      show: !(config.yAxis?.hide ?? false),
      splitLine: { lineStyle: { color: theme.splitLine, type: 'dashed' } },
      axisLabel: { color: theme.textSecondary, fontSize: 11 },
    },
    series: [
      {
        type: 'scatter',
        data: points,
        symbolSize: (val: number[]) => Math.min(30, Math.max(8, val[2])),
        itemStyle: { color: series[0]?.resolvedColor ?? '#2563EB', opacity: 0.8 },
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