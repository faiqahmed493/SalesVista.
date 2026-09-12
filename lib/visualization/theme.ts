import type { EChartsOption } from 'echarts';

export const DEFAULT_COLOR_PALETTE = [
  '#3B82F6', // Electric Blue
  '#10B981', // Emerald Green
  '#8B5CF6', // Violet Purple
  '#F59E0B', // Amber Gold
  '#06B6D4', // Cyan
  '#EC4899', // Rose Pink
  '#F97316', // Coral Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#D946EF', // Fuchsia
  '#84CC16', // Lime Green
  '#EF4444', // Crimson Red
];

export interface ThemeColors {
  bg: string;
  cardBg: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  splitLine: string;
  axisLine: string;
  tooltipBg: string;
  shadow: string;
  backdropFilter: string;
  primary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export const lightTheme: ThemeColors = {
  bg: '#F8F9FA',
  cardBg: '#FFFFFF',
  border: '#F1F3F5',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  splitLine: '#F1F5F9',
  axisLine: '#E5E7EB',
  tooltipBg: 'rgba(255, 255, 255, 0.96)',
  shadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
  backdropFilter: 'none',
  primary: '#F97316',
  success: '#12B886',
  warning: '#F59E0B',
  danger: '#FA5252',
  info: '#06B6D4',
};

export const darkTheme: ThemeColors = {
  bg: '#090D16',
  cardBg: 'rgba(17, 24, 39, 0.85)',
  border: '#1F2937',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  splitLine: '#1F2937',
  axisLine: '#374151',
  tooltipBg: 'rgba(17, 24, 39, 0.96)',
  shadow: '0 8px 30px -4px rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(12px)',
  primary: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
};

export function getBaseEChartsOption(theme: ThemeColors, isDark: boolean): EChartsOption {
  return {
    color: DEFAULT_COLOR_PALETTE,
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: theme.textSecondary,
    },
    tooltip: {
      backgroundColor: theme.tooltipBg,
      borderColor: theme.border,
      borderWidth: 1,
      textStyle: { color: theme.textPrimary, fontSize: 12 },
      extraCssText: `box-shadow: ${theme.shadow}; border-radius: 8px; backdrop-filter: ${theme.backdropFilter}; -webkit-backdrop-filter: ${theme.backdropFilter};`,
    },
    grid: {
      top: 36,
      left: 16,
      right: 24,
      bottom: 32,
      containLabel: true,
    },
  };
}