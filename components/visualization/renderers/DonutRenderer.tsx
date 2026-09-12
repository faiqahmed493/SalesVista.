'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { SubRendererProps } from './types';
import { getBaseEChartsOption, DEFAULT_COLOR_PALETTE } from '@/lib/visualization/theme';

export const DonutRenderer: React.FC<SubRendererProps> = ({
  config,
  data,
  series,
  theme,
  isDark,
  height,
}) => {
  const base = getBaseEChartsOption(theme, isDark);
  const valueKey = series[0]?.key ?? '';
  const donutData = data.map((d, idx) => ({
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
        // Hollow ring (50% inner hole, 75% outer ring)
        radius: ['50%', '75%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: theme.cardBg,
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          scaleSize: 8,
          label: {
            show: true,
            fontSize: 13,
            color: theme.textPrimary,
          },
        },
        data: donutData,
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
