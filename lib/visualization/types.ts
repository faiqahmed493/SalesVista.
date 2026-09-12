export type ChartType =
  | 'line'
  | 'bar'
  | 'area'
  | 'pie'
  | 'donut'
  | 'composed'
  | 'scatter'
  | 'radar'
  | 'funnel'
  | 'boxplot';

export interface ChartSeries {
  key: string;
  label: string;
  chartType?: 'line' | 'bar' | 'area'; // For composed charts
  color?: string;
  unit?: string;
  stackId?: string;
  dashed?: boolean;
  fillOpacity?: number;
}

export interface RadarIndicator {
  name: string;
  max: number;
}

export interface VisualizationConfig {
  type: ChartType;
  title: string;
  description?: string;
  xKey: string;
  series: ChartSeries[];
  unit?: string;
  height?: number;
  stacked?: boolean;
  legend?: boolean;
  isLoading?: boolean;
  radarIndicators?: RadarIndicator[]; // For radar charts
  xAxis?: {
    hide?: boolean;
  };
  yAxis?: {
    hide?: boolean;
    decimals?: number;
    domain?: [number | string, number | string];
  };
  tooltip?: {
    enabled?: boolean;
    decimals?: number;
  };
}

export type DataRecord = Record<string, any>;

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export { DEFAULT_COLOR_PALETTE } from './theme';