'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { SubRendererProps } from './types';
import { getBaseEChartsOption, DEFAULT_COLOR_PALETTE } from '@/lib/visualization/theme';

export const PieRenderer: React.FC<SubRendererProps> = ({
  config,
  data,
  series,
  theme,
  isDark,
  height,
}) => {
  const base = getBaseEChartsOption(theme, isDark);
  const valueKey = series[0]?.key ?? '';
  const pieData = data.map((d, idx) => ({
    name: String(d[config.xKey] ?? ''),
    value: Number(d[valueKey] ?? 0),
    itemStyle: {
      color: DEFAULT_COLOR_PALETTE[idx % DEFAULT_COLOR_PALETTE.length],
    },
  }));

  const showLegend = config.legend ?? true;

  const option: EChartsOption = {
    ...base,
    tooltip: {
      ...base.tooltip,
      trigger: 'item',
      formatter: `{b}: {c}${config.unit ?? ''} ({d}%)`,
    },
    legend: {
      show: showLegend,
      bottom: 0,
      left: 'center',
      orient: 'horizontal',
      itemGap: 16,
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 8,
      textStyle: { color: theme.textSecondary, fontSize: 11 },
    },
    series: [
      {
        type: 'pie',
        radius: [0, '75%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 0,
          borderColor: theme.cardBg,
          borderWidth: 1.5,
        },
        label: {
          show: true,
          color: theme.textSecondary,
          formatter: '{b}: {d}%',
          fontSize: 11,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data: pieData,
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
