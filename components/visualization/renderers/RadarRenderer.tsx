'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { SubRendererProps } from './types';
import { getBaseEChartsOption } from '@/lib/visualization/theme';

export const RadarRenderer: React.FC<SubRendererProps> = ({ config, data, series, theme, isDark, height }) => {
  const base = getBaseEChartsOption(theme, isDark);
  const indicators = config.radarIndicators ?? [{ name: 'Dim 1', max: 100 }, { name: 'Dim 2', max: 100 }];

  const option: EChartsOption = {
    ...base,
    legend: {
      show: config.legend ?? true,
      top: 0,
      left: 'center',
      itemGap: 16,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: theme.textSecondary, fontSize: 11 },
    },
    radar: {
      indicator: indicators,
      axisName: { color: theme.textSecondary, fontSize: 11 },
      splitLine: { lineStyle: { color: theme.splitLine } },
      splitArea: {
        areaStyle: { color: isDark ? ['#111827', '#172033'] : ['#FAF5FF', '#F1F5F9'] },
      },
    },
    series: [
      {
        type: 'radar',
        data: data.map((row, idx) => ({
          name: String(row[config.xKey] ?? `Series ${idx + 1}`),
          value: series.map((s) => Number(row[s.key] ?? 0)),
        })),
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