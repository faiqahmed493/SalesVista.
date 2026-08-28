/**
 * Generic visualization type schema.
 *
 * The AI produces `VisualizationConfig` as plain JSON.
 * `ChartRenderer` consumes it and renders the appropriate Recharts component.
 *
 * Security contract:
 *   - No JavaScript is ever executed from AI output.
 *   - `validateConfig()` is always called before rendering.
 *   - Field names (`xKey`, `series[].key`) are validated against a safe regex.
 */

// ─── Chart types ──────────────────────────────────────────────────────────────

/** Supported chart types. */
export type ChartType = "line" | "bar" | "area" | "pie" | "composed";

/**
 * Per-series chart type override.
 * Only meaningful when the parent `VisualizationConfig.type` is `"composed"`.
 */
export type SeriesChartType = "line" | "bar" | "area";

// ─── Series ───────────────────────────────────────────────────────────────────

/**
 * A single data series within the chart.
 * Maps a field in each `DataRecord` to a visual element (line, bar, etc.).
 */
export interface ChartSeries {
  /**
   * Field name in each `DataRecord` to use as the Y (or pie slice value) source.
   * Must be a valid JavaScript identifier or dot-notation path (e.g. `"metrics.value"`).
   */
  key: string;

  /** Human-readable label used in legend and tooltips. */
  label: string;

  /**
   * Optional hex or CSS color string.
   * Falls back to `DEFAULT_COLOR_PALETTE[index]` if not provided.
   */
  color?: string;

  /**
   * Per-series unit suffix appended to tooltip values.
   * Overrides the config-level `unit` field for this series only.
   * e.g. `"mm"`, `"km/h"`, `"%"`.
   */
  unit?: string;

  /**
   * Stack group identifier.
   * Series sharing the same `stackId` are stacked on top of each other.
   * Applies to `bar` and `area` chart types.
   */
  stackId?: string;

  /**
   * Per-series chart sub-type for `"composed"` charts.
   * Determines whether this series renders as a line, bar, or area.
   */
  chartType?: SeriesChartType;

  /**
   * Render the series using a dashed stroke pattern.
   * Only applies to `line` and `area` chart types.
   */
  dashed?: boolean;

  /**
   * Fill opacity for area charts. Range: 0–1.
   * Defaults to `0.15`.
   */
  fillOpacity?: number;
}

// ─── Configuration ────────────────────────────────────────────────────────────

/**
 * Complete visualization configuration.
 *
 * This is the structure the AI must output as JSON.
 * It is the only input `ChartRenderer` accepts — no custom React code.
 */
export interface VisualizationConfig {
  /** Determines which Recharts chart component is rendered. */
  type: ChartType;

  /** Title displayed at the top of the chart card. Max 200 characters. */
  title: string;

  /** Optional one-line description / subtitle. */
  description?: string;

  /**
   * The field in each `DataRecord` used as the X-axis value.
   * For pie charts, this field provides the slice name (category).
   * Must pass the safe field-name pattern check.
   */
  xKey: string;

  /**
   * One or more Y-axis data series.
   * At least one entry is required.
   * For pie charts, only `series[0].key` is used as the slice value.
   */
  series: ChartSeries[];

  /**
   * Global unit suffix appended to all values in tooltips and axis ticks.
   * Examples: `"°C"`, `"km/h"`, `"%"`, `"$"`, `"mm"`.
   * A per-series `unit` overrides this for that series.
   */
  unit?: string;

  /** X-axis display options. */
  xAxis?: {
    /** Optional axis label below the X axis. */
    label?: string;
    /** Hide the X axis entirely. Defaults to false. */
    hide?: boolean;
  };

  /** Y-axis display options. */
  yAxis?: {
    /** Optional axis label beside the Y axis. */
    label?: string;
    /**
     * Y-axis domain bounds.
     * Use numbers for fixed bounds, or `"auto"` / `"dataMin"` / `"dataMax"` for dynamic.
     * Example: `[0, 100]` to fix a percentage axis.
     */
    domain?: [
      number | "auto" | "dataMin" | "dataMax",
      number | "auto" | "dataMin" | "dataMax"
    ];
    /** Decimal places shown on Y-axis tick labels. Defaults to 0. */
    decimals?: number;
    /** Hide the Y axis. Defaults to false. */
    hide?: boolean;
  };

  /** Tooltip configuration. */
  tooltip?: {
    /** Show the tooltip on hover. Defaults to true. */
    enabled?: boolean;
    /** Decimal precision shown in the tooltip. Defaults to 1. */
    decimals?: number;
  };

  /**
   * Show a legend.
   * Defaults to `true` when `series.length > 1`, `false` otherwise.
   */
  legend?: boolean;

  /**
   * Stack all series.
   * For `bar`: stacked bar chart.
   * For `area`: stacked area chart.
   * Ignored for `line`, `pie`, `composed`.
   */
  stacked?: boolean;

  /**
   * Chart body height in pixels.
   * Defaults to 260. Min 60, max 1200.
   */
  height?: number;

  /**
   * When `true`, `ChartRenderer` renders a skeleton loading placeholder
   * instead of the actual chart.
   */
  isLoading?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

/**
 * A single data point row.
 * Field names must correspond to `config.xKey` and `config.series[].key`.
 *
 * @example
 * ```ts
 * const row: DataRecord = {
 *   time: "14:00",
 *   temperature: 32.4,
 *   feelsLike: 35.1,
 * };
 * ```
 */
export type DataRecord = Record<string, string | number | null | undefined>;

// ─── Validation result ────────────────────────────────────────────────────────

/** Discriminated union returned by `validateConfig()`. */
export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

// ─── Default color palette ────────────────────────────────────────────────────

/**
 * 8-color palette assigned to series that do not specify a `color`.
 * Chosen to be legible on both light (#f8fafc) and dark (#09090b) backgrounds.
 */
export const DEFAULT_COLOR_PALETTE: readonly string[] = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#38bdf8", // sky
  "#fb7185", // rose
  "#14b8a6", // teal
  "#818cf8", // indigo
];
