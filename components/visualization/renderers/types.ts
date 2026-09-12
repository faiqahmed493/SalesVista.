// src/components/visualization/renderers/types.ts
import { VisualizationConfig, DataRecord, ChartSeries } from '@/lib/visualization/types';
import { ThemeColors } from '@/lib/visualization/theme';

export interface SubRendererProps {
  config: VisualizationConfig;
  data: DataRecord[];
  series: (ChartSeries & { resolvedColor: string })[];
  theme: ThemeColors;
  isDark: boolean;
  height: number;
}