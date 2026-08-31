/**
 * LLM response schema and runtime validator.
 *
 * The AI must return JSON matching `LLMResponse`.
 * `validateLLMResponse()` is called before any data leaves the server.
 *
 * Security guarantees:
 *   - validateConfig() is called on visualization configs (blocks prototype pollution)
 *   - answer is stripped of any HTML/script tags
 *   - insights are string-checked and capped in length
 *   - visualization field names are validated by the existing SAFE_KEY_PATTERN
 *
 * The frontend receives `ChatApiResponse` — never the raw LLM output.
 */

import { validateConfig } from "@/lib/visualization/validate";
import type { VisualizationConfig, DataRecord } from "@/lib/visualization/types";

// ─── LLM output schema ────────────────────────────────────────────────────────

export type LLMToolUsed =
  | "get_current_weather"
  | "get_hourly_weather"
  | "get_daily_weather"
  | "none";

export interface LLMVisualizationSeries {
  key: string;
  label: string;
  unit?: string;
  color?: string;
  dashed?: boolean;
  fillOpacity?: number;
  chartType?: string;
}

export interface LLMVisualization {
  type: string;
  title: string;
  description?: string;
  xKey: string;
  series: LLMVisualizationSeries[];
  unit?: string;
  legend?: boolean;
  stacked?: boolean;
  height?: number;
}

/** The raw JSON the LLM must produce. */
export interface LLMResponse {
  answer: string;
  shouldVisualize: boolean;
  visualization?: LLMVisualization;
  insights?: string[];
  toolUsed?: LLMToolUsed;
}

// ─── What we return to the frontend ─────────────────────────────────────────

/**
 * Validated response sent to the browser.
 * visualization is a paired (config + data) object ready for ChartRenderer.
 */
export interface ChatApiResponse {
  answer: string;
  shouldVisualize: boolean;
  visualization?: {
    config: VisualizationConfig;
    data: DataRecord[];
  };
  insights?: string[];
  canAddToDashboard: boolean;
  /** "live" = real LLM, "mock" = fallback mock engine */
  mode: "live" | "mock";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip potential HTML tags from AI text output */
function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // remove tags
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .slice(0, 4000); // absolute cap
}

const ALLOWED_TOOL_NAMES: LLMToolUsed[] = [
  "get_current_weather",
  "get_hourly_weather",
  "get_daily_weather",
  "none",
];

// ─── Validator ────────────────────────────────────────────────────────────────

/**
 * Parse and validate a raw LLM JSON string.
 *
 * Returns a validated `LLMResponse` or throws with a descriptive error.
 * The caller should catch and return a safe fallback.
 */
export function validateLLMResponse(rawContent: string): LLMResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error(`LLM returned non-JSON: ${rawContent.slice(0, 200)}`);
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("LLM response must be a plain object");
  }

  const obj = parsed as Record<string, unknown>;

  // answer
  if (typeof obj.answer !== "string" || !obj.answer.trim()) {
    throw new Error("LLM response missing `answer` string");
  }

  // shouldVisualize
  if (typeof obj.shouldVisualize !== "boolean") {
    // coerce if possible
    obj.shouldVisualize = Boolean(obj.shouldVisualize);
  }

  // toolUsed (optional)
  if (obj.toolUsed !== undefined) {
    if (!ALLOWED_TOOL_NAMES.includes(obj.toolUsed as LLMToolUsed)) {
      obj.toolUsed = "none";
    }
  }

  // insights (optional)
  let insights: string[] | undefined;
  if (Array.isArray(obj.insights)) {
    insights = (obj.insights as unknown[])
      .filter((s) => typeof s === "string")
      .map((s) => sanitizeText(s as string))
      .filter((s) => s.length > 0)
      .slice(0, 8);
  }

  // visualization (only if shouldVisualize)
  let visualization: LLMVisualization | undefined;
  if (obj.shouldVisualize && obj.visualization) {
    // Run through the existing security validator
    const vizResult = validateConfig(obj.visualization);
    if (!vizResult.valid) {
      // Degrade gracefully — return text-only answer
      obj.shouldVisualize = false;
      console.warn(
        "[AI] Visualization config rejected:",
        vizResult.errors.join(", ")
      );
    } else {
      visualization = obj.visualization as LLMVisualization;
    }
  }

  return {
    answer: sanitizeText(obj.answer as string),
    shouldVisualize: Boolean(obj.shouldVisualize),
    visualization,
    insights,
    toolUsed: (obj.toolUsed as LLMToolUsed) ?? "none",
  };
}

/**
 * Convert a validated LLMVisualization into a VisualizationConfig.
 * These types are compatible — this is mostly a cast with safe defaults.
 */
export function toVisualizationConfig(
  viz: LLMVisualization
): VisualizationConfig {
  return {
    type: viz.type as VisualizationConfig["type"],
    title: viz.title,
    description: viz.description,
    xKey: viz.xKey,
    series: viz.series.map((s) => ({
      key: s.key,
      label: s.label,
      unit: s.unit,
      color: s.color,
      dashed: s.dashed,
      fillOpacity: s.fillOpacity,
      chartType: s.chartType as VisualizationConfig["series"][0]["chartType"],
    })),
    unit: viz.unit,
    legend: viz.legend,
    stacked: viz.stacked,
    height: viz.height ?? 220,
    tooltip: { enabled: true, decimals: 1 },
  };
}

/**
 * Cross-check that every series key and xKey exist in the actual data.
 * If a key is missing, strip that series (don't crash the chart).
 *
 * Returns the pruned config and data, or null if nothing can be rendered.
 */
export function reconcileVisualization(
  viz: LLMVisualization,
  chartData: DataRecord[]
): { config: VisualizationConfig; data: DataRecord[] } | null {
  if (!chartData.length) return null;

  const sampleKeys = new Set(Object.keys(chartData[0]!));

  // Check xKey exists
  if (!sampleKeys.has(viz.xKey)) {
    console.warn(`[AI] xKey "${viz.xKey}" not found in data. Keys: ${[...sampleKeys].join(", ")}`);
    return null;
  }

  // Filter out series with missing keys
  const validSeries = viz.series.filter((s) => {
    if (!sampleKeys.has(s.key)) {
      console.warn(`[AI] series key "${s.key}" not found in data`);
      return false;
    }
    return true;
  });

  if (!validSeries.length) {
    console.warn("[AI] No valid series after reconciliation");
    return null;
  }

  const config = toVisualizationConfig({ ...viz, series: validSeries });
  return { config, data: chartData };
}
