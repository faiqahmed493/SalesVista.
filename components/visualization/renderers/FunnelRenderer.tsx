'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { SubRendererProps } from './types';
import { getBaseEChartsOption } from '@/lib/visualization/theme';

export const FunnelRenderer: React.FC<SubRendererProps> = ({ config, data, series, theme, isDark, height }) => {
  const base = getBaseEChartsOption(theme, isDark);
  const valKey = series[0]?.key ?? '';
  const funnelData = data.map((d) => ({ name: String(d[config.xKey] ?? ''), value: Number(d[valKey] ?? 0) }));

  const option: EChartsOption = {
    ...base,
    tooltip: { ...base.tooltip, trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [
      {
        name: config.title,
        type: 'funnel',
        left: '10%',
        top: '10%',
        bottom: '10%',
        width: '80%',
        sort: 'descending',
        gap: 2,
        label: { show: true, position: 'inside', color: '#fff', fontSize: 11 },
        itemStyle: { borderColor: theme.cardBg, borderWidth: 2 },
        data: funnelData,
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