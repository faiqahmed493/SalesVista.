// "use client";

// /**
//  * ChartRenderer — Generic JSON-driven visualization component.
//  *
//  * Accepts a `VisualizationConfig` (validated JSON) and a `DataRecord[]`
//  * and renders the appropriate Recharts chart component.
//  *
//  * Security model:
//  *   - `validateConfig()` runs before any rendering
//  *   - No code from the config is ever executed
//  *   - Field names are only used as object property accessors, never eval'd
//  *   - Colors are CSS strings passed to SVG attributes only
//  *
//  * Supported types: "line" | "bar" | "area" | "pie" | "composed"
//  */

// import React from "react";
// import {
//   LineChart,
//   BarChart,
//   AreaChart,
//   PieChart,
//   ComposedChart,
//   Line,
//   Bar,
//   Area,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// import type {
//   VisualizationConfig,
//   DataRecord,
//   ChartSeries,
// } from "@/lib/visualization/types";
// import { DEFAULT_COLOR_PALETTE } from "@/lib/visualization/types";
// import { validateConfig } from "@/lib/visualization/validate";

// // ─── Public props ─────────────────────────────────────────────────────────────

// export interface ChartRendererProps {
//   /** Validated (or to-be-validated) visualization configuration. */
//   config: VisualizationConfig;
//   /** Data records. Each must have fields matching config.xKey and series[].key. */
//   data: DataRecord[];
//   /** Optional additional className for the outer wrapper div. */
//   className?: string;
// }

// // ─── Internal types ───────────────────────────────────────────────────────────

// /** Series with color guaranteed to be resolved. */
// interface ResolvedSeries extends ChartSeries {
//   resolvedColor: string;
// }

// interface RendererProps {
//   config: VisualizationConfig;
//   data: DataRecord[];
//   series: ResolvedSeries[];
//   height: number;
// }

// // ─── Shared constants ─────────────────────────────────────────────────────────

// const GRID_COLOR = "rgba(128,128,128,0.12)";
// const MUTED_COLOR = "var(--muted-foreground, #888)";
// const CARD_BG = "var(--card, #fff)";
// const BORDER_COLOR = "var(--border, #e2e8f0)";
// const FG_COLOR = "var(--foreground, #0f172a)";

// // ─── Utility helpers ──────────────────────────────────────────────────────────

// function resolveUnit(
//   ser: ChartSeries,
//   globalUnit: string | undefined
// ): string {
//   return ser.unit ?? globalUnit ?? "";
// }

// function formatValue(
//   value: number | string | null | undefined,
//   decimals: number,
//   unit: string
// ): string {
//   if (value === null || value === undefined) return "—";
//   if (typeof value === "string") return `${value}${unit}`;
//   return `${value.toFixed(decimals)}${unit}`;
// }

// function resolveSeries(config: VisualizationConfig): ResolvedSeries[] {
//   return config.series.map((s, i) => ({
//     ...s,
//     resolvedColor:
//       s.color ?? DEFAULT_COLOR_PALETTE[i % DEFAULT_COLOR_PALETTE.length]!,
//   }));
// }

// function shouldShowLegend(config: VisualizationConfig): boolean {
//   if (config.legend !== undefined) return config.legend;
//   return config.series.length > 1;
// }

// // ─── Shared custom tooltip ────────────────────────────────────────────────────

// function GenericTooltip({
//   active,
//   payload,
//   label,
//   series,
//   globalUnit,
//   decimals = 1,
// }: {
//   active?: boolean;
//   payload?: { dataKey: string; name: string; value: number | string; color: string }[];
//   label?: string;
//   series: ResolvedSeries[];
//   globalUnit?: string;
//   decimals?: number;
// }) {
//   if (!active || !payload?.length) return null;

//   return (
//     <div
//       style={{
//         background: CARD_BG,
//         border: `1px solid ${BORDER_COLOR}`,
//         borderRadius: 8,
//         padding: "10px 14px",
//         boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
//         fontSize: 12,
//         minWidth: 120,
//       }}
//     >
//       {label !== undefined && (
//         <p
//           style={{
//             fontWeight: 600,
//             marginBottom: 6,
//             color: FG_COLOR,
//             fontSize: 11,
//           }}
//         >
//           {label}
//         </p>
//       )}
//       {payload.map((entry) => {
//         const serCfg = series.find((s) => s.key === entry.dataKey);
//         const unit = serCfg ? resolveUnit(serCfg, globalUnit) : (globalUnit ?? "");
//         return (
//           <p
//             key={entry.dataKey}
//             style={{ color: entry.color, margin: "3px 0", fontWeight: 500 }}
//           >
//             {entry.name}:{" "}
//             <strong style={{ color: FG_COLOR }}>
//               {formatValue(entry.value, decimals, unit)}
//             </strong>
//           </p>
//         );
//       })}
//     </div>
//   );
// }

// // ─── Shared axis helpers ──────────────────────────────────────────────────────

// function makeYFormatter(unit: string, decimals: number) {
//   return (v: number) => `${v.toFixed(decimals)}${unit}`;
// }

// const COMMON_X_AXIS_PROPS = {
//   tick: { fill: MUTED_COLOR, fontSize: 11 },
//   axisLine: false as const,
//   tickLine: false as const,
// };

// function commonYAxisProps(unit: string, decimals: number, hide?: boolean) {
//   // Estimate tick width: each digit ~7px, unit suffix ~6px/char, plus padding
//   const estimatedWidth = Math.max(38, 28 + unit.length * 7);
//   return {
//     tick: { fill: MUTED_COLOR, fontSize: 11 },
//     axisLine: false as const,
//     tickLine: false as const,
//     tickFormatter: makeYFormatter(unit, decimals),
//     hide: hide ?? false,
//     width: estimatedWidth,
//   };
// }

// // ─── Sub-renderers ────────────────────────────────────────────────────────────

// /** Line chart — one or more series as <Line> elements */
// function LineRenderer({ config, data, series, height }: RendererProps) {
//   const unit = config.unit ?? "";
//   const decimals = config.yAxis?.decimals ?? 0;
//   const tooltipDecimals = config.tooltip?.decimals ?? 1;

//   return (
//     <ResponsiveContainer width="100%" height={height}>
//       <LineChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
//         <CartesianGrid strokeDasharray="4 4" stroke={GRID_COLOR} vertical={false} />
//         <XAxis
//           dataKey={config.xKey}
//           {...COMMON_X_AXIS_PROPS}
//           hide={config.xAxis?.hide}
//         />
//         <YAxis
//           {...commonYAxisProps(unit, decimals, config.yAxis?.hide)}
//           domain={config.yAxis?.domain}
//         />
//         {(config.tooltip?.enabled ?? true) && (
//           <Tooltip
//             content={
//               <GenericTooltip
//                 series={series}
//                 globalUnit={config.unit}
//                 decimals={tooltipDecimals}
//               />
//             }
//           />
//         )}
//         {shouldShowLegend(config) && (
//           <Legend
//             wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
//             iconType="circle"
//             iconSize={8}
//           />
//         )}
//         {series.map((s) => (
//           <Line
//             key={s.key}
//             type="monotone"
//             dataKey={s.key}
//             name={s.label}
//             stroke={s.resolvedColor}
//             strokeWidth={2.5}
//             strokeDasharray={s.dashed ? "5 3" : undefined}
//             dot={false}
//             activeDot={{ r: 5, strokeWidth: 0, fill: s.resolvedColor }}
//           />
//         ))}
//       </LineChart>
//     </ResponsiveContainer>
//   );
// }

// /** Bar chart — one or more series as <Bar> elements */
// function BarRenderer({ config, data, series, height }: RendererProps) {
//   const unit = config.unit ?? "";
//   const decimals = config.yAxis?.decimals ?? 0;
//   const tooltipDecimals = config.tooltip?.decimals ?? 1;
//   const stacked = config.stacked ?? false;

//   return (
//     <ResponsiveContainer width="100%" height={height}>
//       <BarChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
//         <CartesianGrid strokeDasharray="4 4" stroke={GRID_COLOR} vertical={false} />
//         <XAxis
//           dataKey={config.xKey}
//           {...COMMON_X_AXIS_PROPS}
//           hide={config.xAxis?.hide}
//         />
//         <YAxis
//           {...commonYAxisProps(unit, decimals, config.yAxis?.hide)}
//           domain={config.yAxis?.domain}
//         />
//         {(config.tooltip?.enabled ?? true) && (
//           <Tooltip
//             cursor={{ fill: "rgba(128,128,128,0.06)" }}
//             content={
//               <GenericTooltip
//                 series={series}
//                 globalUnit={config.unit}
//                 decimals={tooltipDecimals}
//               />
//             }
//           />
//         )}
//         {shouldShowLegend(config) && (
//           <Legend
//             wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
//             iconType="square"
//             iconSize={10}
//           />
//         )}
//         {series.map((s) => (
//           <Bar
//             key={s.key}
//             dataKey={s.key}
//             name={s.label}
//             fill={s.resolvedColor}
//             radius={[3, 3, 0, 0]}
//             maxBarSize={40}
//             stackId={stacked ? (s.stackId ?? "stack") : s.stackId}
//           />
//         ))}
//       </BarChart>
//     </ResponsiveContainer>
//   );
// }

// /** Area chart — one or more series as <Area> elements with fill */
// function AreaRenderer({ config, data, series, height }: RendererProps) {
//   const unit = config.unit ?? "";
//   const decimals = config.yAxis?.decimals ?? 0;
//   const tooltipDecimals = config.tooltip?.decimals ?? 1;
//   const stacked = config.stacked ?? false;

//   return (
//     <ResponsiveContainer width="100%" height={height}>
//       <AreaChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
//         <defs>
//           {series.map((s) => (
//             <linearGradient
//               key={s.key}
//               id={`gradient-${s.key}`}
//               x1="0"
//               y1="0"
//               x2="0"
//               y2="1"
//             >
//               <stop offset="5%" stopColor={s.resolvedColor} stopOpacity={0.25} />
//               <stop offset="95%" stopColor={s.resolvedColor} stopOpacity={0.02} />
//             </linearGradient>
//           ))}
//         </defs>
//         <CartesianGrid strokeDasharray="4 4" stroke={GRID_COLOR} vertical={false} />
//         <XAxis
//           dataKey={config.xKey}
//           {...COMMON_X_AXIS_PROPS}
//           hide={config.xAxis?.hide}
//         />
//         <YAxis
//           {...commonYAxisProps(unit, decimals, config.yAxis?.hide)}
//           domain={config.yAxis?.domain}
//         />
//         {(config.tooltip?.enabled ?? true) && (
//           <Tooltip
//             content={
//               <GenericTooltip
//                 series={series}
//                 globalUnit={config.unit}
//                 decimals={tooltipDecimals}
//               />
//             }
//           />
//         )}
//         {shouldShowLegend(config) && (
//           <Legend
//             wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
//             iconType="circle"
//             iconSize={8}
//           />
//         )}
//         {series.map((s) => (
//           <Area
//             key={s.key}
//             type="monotone"
//             dataKey={s.key}
//             name={s.label}
//             stroke={s.resolvedColor}
//             strokeWidth={2}
//             strokeDasharray={s.dashed ? "5 3" : undefined}
//             fill={`url(#gradient-${s.key})`}
//             fillOpacity={s.fillOpacity ?? 1}
//             dot={false}
//             activeDot={{ r: 5, strokeWidth: 0, fill: s.resolvedColor }}
//             stackId={stacked ? (s.stackId ?? "stack") : s.stackId}
//           />
//         ))}
//       </AreaChart>
//     </ResponsiveContainer>
//   );
// }

// /** Pie chart — uses series[0].key as slice value, xKey as slice name */
// function PieRenderer({ config, data, series, height }: RendererProps) {
//   const valueKey = series[0]?.key ?? "";
//   const tooltipDecimals = config.tooltip?.decimals ?? 0;
//   const unit = series[0]?.unit ?? config.unit ?? "";

//   const pieData = data.map((row) => ({
//     name: String(row[config.xKey] ?? ""),
//     value: Number(row[valueKey] ?? 0),
//   }));

//   const totalValue = pieData.reduce((sum, d) => sum + d.value, 0);

//   return (
//     <ResponsiveContainer width="100%" height={height}>
//       <PieChart>
//         <Pie
//           data={pieData}
//           cx="50%"
//           cy="50%"
//           outerRadius="75%"
//           innerRadius="35%"
//           dataKey="value"
//           nameKey="name"
//           strokeWidth={0}
//           paddingAngle={2}
//         >
//           {pieData.map((_, idx) => (
//             <Cell
//               key={idx}
//               fill={
//                 series[0]?.color ??
//                 DEFAULT_COLOR_PALETTE[idx % DEFAULT_COLOR_PALETTE.length]!
//               }
//             />
//           ))}
//         </Pie>
//         {(config.tooltip?.enabled ?? true) && (
//           <Tooltip
//             content={(props) => {
//               if (!props.active || !props.payload?.length) return null;
//               const item = props.payload[0]!;
//               const pct = totalValue > 0 ? (((item.value as number) / totalValue) * 100).toFixed(1) : "0";
//               return (
//                 <div
//                   style={{
//                     background: CARD_BG,
//                     border: `1px solid ${BORDER_COLOR}`,
//                     borderRadius: 8,
//                     padding: "10px 14px",
//                     boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
//                     fontSize: 12,
//                   }}
//                 >
//                   <p style={{ fontWeight: 600, color: FG_COLOR, marginBottom: 4 }}>
//                     {item.name}
//                   </p>
//                   <p style={{ color: MUTED_COLOR }}>
//                     {formatValue(item.value as number, tooltipDecimals, unit)}{" "}
//                     <span style={{ color: FG_COLOR, fontWeight: 600 }}>({pct}%)</span>
//                   </p>
//                 </div>
//               );
//             }}
//           />
//         )}
//         {shouldShowLegend(config) && (
//           <Legend
//             wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
//             iconType="circle"
//             iconSize={8}
//           />
//         )}
//       </PieChart>
//     </ResponsiveContainer>
//   );
// }

// /** Composed chart — mixed series types (line + bar + area in one chart) */
// function ComposedRenderer({ config, data, series, height }: RendererProps) {
//   const unit = config.unit ?? "";
//   const decimals = config.yAxis?.decimals ?? 0;
//   const tooltipDecimals = config.tooltip?.decimals ?? 1;

//   return (
//     <ResponsiveContainer width="100%" height={height}>
//       <ComposedChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
//         <CartesianGrid strokeDasharray="4 4" stroke={GRID_COLOR} vertical={false} />
//         <XAxis
//           dataKey={config.xKey}
//           {...COMMON_X_AXIS_PROPS}
//           hide={config.xAxis?.hide}
//         />
//         <YAxis
//           {...commonYAxisProps(unit, decimals, config.yAxis?.hide)}
//           domain={config.yAxis?.domain}
//         />
//         {(config.tooltip?.enabled ?? true) && (
//           <Tooltip
//             content={
//               <GenericTooltip
//                 series={series}
//                 globalUnit={config.unit}
//                 decimals={tooltipDecimals}
//               />
//             }
//           />
//         )}
//         {shouldShowLegend(config) && (
//           <Legend
//             wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
//             iconType="circle"
//             iconSize={8}
//           />
//         )}
//         {series.map((s) => {
//           const type = s.chartType ?? "line";
//           if (type === "bar") {
//             return (
//               <Bar
//                 key={s.key}
//                 dataKey={s.key}
//                 name={s.label}
//                 fill={s.resolvedColor}
//                 radius={[3, 3, 0, 0]}
//                 maxBarSize={40}
//                 stackId={s.stackId}
//               />
//             );
//           }
//           if (type === "area") {
//             return (
//               <Area
//                 key={s.key}
//                 type="monotone"
//                 dataKey={s.key}
//                 name={s.label}
//                 stroke={s.resolvedColor}
//                 fill={s.resolvedColor}
//                 fillOpacity={s.fillOpacity ?? 0.12}
//                 strokeWidth={2}
//                 dot={false}
//                 stackId={s.stackId}
//               />
//             );
//           }
//           // default: line
//           return (
//             <Line
//               key={s.key}
//               type="monotone"
//               dataKey={s.key}
//               name={s.label}
//               stroke={s.resolvedColor}
//               strokeWidth={2.5}
//               strokeDasharray={s.dashed ? "5 3" : undefined}
//               dot={false}
//               activeDot={{ r: 5, strokeWidth: 0 }}
//             />
//           );
//         })}
//       </ComposedChart>
//     </ResponsiveContainer>
//   );
// }

// // ─── State components ─────────────────────────────────────────────────────────

// function LoadingState({ height }: { height: number }) {
//   return (
//     <div
//       className="skeleton"
//       style={{ height, width: "100%", borderRadius: 8 }}
//       aria-label="Loading chart…"
//     />
//   );
// }

// function EmptyState({ title, height }: { title: string; height: number }) {
//   return (
//     <div
//       style={{
//         height,
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         color: MUTED_COLOR,
//         fontSize: 13,
//         gap: 8,
//       }}
//       role="status"
//       aria-label={`No data available for ${title}`}
//     >
//       <span style={{ fontSize: 28, opacity: 0.5 }}>📊</span>
//       <span>No data available</span>
//     </div>
//   );
// }

// function ConfigErrorState({ errors }: { errors: string[] }) {
//   return (
//     <div
//       style={{
//         background: "rgba(239,68,68,0.06)",
//         border: "1px solid rgba(239,68,68,0.25)",
//         borderRadius: 8,
//         padding: "12px 16px",
//         fontSize: 12,
//         color: "#ef4444",
//       }}
//       role="alert"
//     >
//       <p style={{ fontWeight: 600, marginBottom: 6 }}>
//         ⚠️ Invalid visualization config
//       </p>
//       <ul style={{ paddingLeft: 16, margin: 0 }}>
//         {errors.map((e, i) => (
//           <li key={i} style={{ marginBottom: 2 }}>
//             {e}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// // ─── Main ChartRenderer ───────────────────────────────────────────────────────

// /**
//  * Generic JSON-driven chart renderer.
//  *
//  * Usage:
//  * ```tsx
//  * <ChartRenderer
//  *   config={{
//  *     type: "line",
//  *     title: "Temperature Forecast",
//  *     xKey: "time",
//  *     series: [{ key: "temp", label: "Temperature", color: "#3b82f6" }],
//  *     unit: "°C",
//  *   }}
//  *   data={hourlyData}
//  * />
//  * ```
//  *
//  * The `config` can be safely sourced from an AI response as long as it has
//  * been validated by `validateConfig()` — which this component does automatically.
//  */
// export default function ChartRenderer({
//   config,
//   data,
//   className,
// }: ChartRendererProps) {
//   const height = Math.max(60, Math.min(1200, config.height ?? 260));

//   // ── 1. Validate config (security boundary) ───────────────────────────
//   const validation = validateConfig(config);
//   if (!validation.valid) {
//     return (
//       <div
//         className={className}
//         style={{
//           background: CARD_BG,
//           border: `1px solid ${BORDER_COLOR}`,
//           borderRadius: 12,
//           padding: 20,
//         }}
//       >
//         <ConfigErrorState errors={validation.errors} />
//       </div>
//     );
//   }

//   // ── 2. Resolve series colors ─────────────────────────────────────────
//   const series = resolveSeries(config);

//   // ── 3. Build the card layout ─────────────────────────────────────────
//   const rendererProps: RendererProps = { config, data, series, height };

//   return (
//     <div
//       className={className}
//       style={{
//         background: CARD_BG,
//         border: `1px solid ${BORDER_COLOR}`,
//         borderRadius: 12,
//         overflow: "hidden",
//       }}
//     >
//       {/* Card header */}
//       <div
//         style={{
//           padding: "18px 20px 14px",
//           borderBottom: `1px solid ${BORDER_COLOR}`,
//         }}
//       >
//         <h3
//           style={{
//             fontSize: 13,
//             fontWeight: 600,
//             color: FG_COLOR,
//             margin: 0,
//             lineHeight: 1.3,
//           }}
//         >
//           {config.title}
//         </h3>
//         {config.description && (
//           <p
//             style={{
//               fontSize: 11,
//               color: MUTED_COLOR,
//               marginTop: 3,
//               marginBottom: 0,
//             }}
//           >
//             {config.description}
//           </p>
//         )}
//       </div>

//       {/* Chart body */}
//       <div style={{ padding: "16px 12px 16px 8px" }}>
//         {/* Loading */}
//         {config.isLoading && <LoadingState height={height} />}

//         {/* Empty */}
//         {!config.isLoading && (!data || data.length === 0) && (
//           <EmptyState title={config.title} height={height} />
//         )}

//         {/* Chart */}
//         {!config.isLoading && data && data.length > 0 && (
//           <>
//             {config.type === "line" && <LineRenderer {...rendererProps} />}
//             {config.type === "bar" && <BarRenderer {...rendererProps} />}
//             {config.type === "area" && <AreaRenderer {...rendererProps} />}
//             {config.type === "pie" && <PieRenderer {...rendererProps} />}
//             {config.type === "composed" && (
//               <ComposedRenderer {...rendererProps} />
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useMemo } from 'react';
import type { VisualizationConfig, DataRecord } from '@/lib/visualization/types';
import { DEFAULT_COLOR_PALETTE } from '@/lib/visualization/types';
import { lightTheme, darkTheme } from '@/lib/visualization/theme';
import { ChartCard } from './ChartCard';
import { DonutRenderer } from './renderers/DonutRenderer';

import { LineRenderer } from './renderers/LineRenderer';
import { BarRenderer } from './renderers/BarRenderer';
import { AreaRenderer } from './renderers/AreaRenderer';
import { PieRenderer } from './renderers/PieRenderer';
import { ComposedRenderer } from './renderers/ComposedRenderer';
import { ScatterRenderer } from './renderers/ScatterRenderer';
import { RadarRenderer } from './renderers/RadarRenderer';
import { FunnelRenderer } from './renderers/FunnelRenderer';
import { BoxplotRenderer } from './renderers/BoxplotRenderer';

export interface ChartRendererProps {
  config: VisualizationConfig;
  data: DataRecord[];
  isDark?: boolean;
  onRemove?: () => void;
  className?: string;
}

export default function ChartRenderer({
  config,
  data,
  isDark = false,
  onRemove,
  className,
}: ChartRendererProps) {
  const height = Math.max(120, Math.min(1000, config.height ?? 300));
  const theme = isDark ? darkTheme : lightTheme;

  // Resolve palette mappings safely with title-based color variation
  const resolvedSeries = useMemo(() => {
    const titleHash = (config.title || '')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return (config.series || []).map((s, i) => {
      // Offset palette starting index based on chart title hash
      const colorIndex = (titleHash + i) % DEFAULT_COLOR_PALETTE.length;
      const defaultColor = DEFAULT_COLOR_PALETTE[colorIndex]!;

      // Handle common metric semantic overrides if color is not specified
      let colorOverride = s.color;
      if (!colorOverride) {
        const labelLower = (s.label || '').toLowerCase();
        const keyLower = (s.key || '').toLowerCase();
        if (labelLower.includes('profit') || keyLower.includes('profit')) {
          colorOverride = '#10B981'; // Emerald Green for Profit
        } else if (labelLower.includes('loss') || keyLower.includes('loss')) {
          colorOverride = '#EF4444'; // Red for Loss
        } else if (labelLower.includes('discount') || keyLower.includes('discount')) {
          colorOverride = '#F59E0B'; // Amber for Discount
        } else {
          colorOverride = defaultColor;
        }
      }

      return {
        ...s,
        resolvedColor: colorOverride,
      };
    });
  }, [config.series, config.title]);

  const rendererProps = {
    config,
    data,
    series: resolvedSeries,
    theme,
    isDark,
    height,
  };

  return (
    <div className={className}>
      <ChartCard
        title={config.title}
        description={config.description}
        theme={theme}
        onRemove={onRemove}
      >
        {config.isLoading ? (
          <div
            style={{
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.textSecondary,
              fontSize: 13,
            }}
          >
            Loading visualization...
          </div>
        ) : !data || data.length === 0 ? (
          <div
            style={{
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.textSecondary,
              fontSize: 13,
            }}
          >
            📊 No data available
          </div>
        ) : (
          <>
            {config.type === 'line' && <LineRenderer {...rendererProps} />}
            {config.type === 'bar' && <BarRenderer {...rendererProps} />}
            {config.type === 'area' && <AreaRenderer {...rendererProps} />}
            {config.type === 'pie' && <PieRenderer {...rendererProps} />}
            {config.type === 'donut' && <DonutRenderer {...rendererProps} />}
            {config.type === 'composed' && <ComposedRenderer {...rendererProps} />}
            {config.type === 'scatter' && <ScatterRenderer {...rendererProps} />}
            {config.type === 'radar' && <RadarRenderer {...rendererProps} />}
            {config.type === 'funnel' && <FunnelRenderer {...rendererProps} />}
            {config.type === 'boxplot' && <BoxplotRenderer {...rendererProps} />}
          </>
        )}
      </ChartCard>
    </div>
  );
}