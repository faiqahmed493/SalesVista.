import { validateConfig } from "@/lib/visualization/validate";
import type { VisualizationConfig, DataRecord, RadarIndicator } from "@/lib/visualization/types";

export interface LLMVisualizationSeries {
  key: string;
  label: string;
  color?: string;
  chartType?: "line" | "bar" | "area";
  dashed?: boolean;
}

export interface LLMVisualization {
  type: string;
  title: string;
  description?: string;
  xKey: string;
  unit?: string;
  height?: number;
  stacked?: boolean;
  legend?: boolean;
  radarIndicators?: RadarIndicator[];
  series: LLMVisualizationSeries[];
}

export interface LLMResponse {
  answerSummary: string;
  sqlQuery: string;
  shouldVisualize: boolean;
  visualization?: LLMVisualization;
  insights?: string[];
}

import type { VisualizationPayload } from "@/lib/ai/chatTypes";

export interface ChatApiResponse {
  answer: string;
  sqlQuery?: string;
  queryData?: DataRecord[];
  shouldVisualize: boolean;
  visualization?: VisualizationPayload;
  insights?: string[];
  canAddToDashboard: boolean;
  mode: "live" | "mock";
}

function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .slice(0, 4000);
}

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

  const answerSummary =
    typeof obj.answerSummary === "string" && obj.answerSummary.trim()
      ? obj.answerSummary
      : typeof obj.answer === "string" && obj.answer.trim()
      ? obj.answer
      : "No answer summary provided.";

  const sqlQuery = typeof obj.sqlQuery === "string" ? obj.sqlQuery.trim() : "";

  const shouldVisualize = Boolean(obj.shouldVisualize ?? obj.visualization ?? (obj as any).config);

  let insights: string[] | undefined;
  if (Array.isArray(obj.insights)) {
    insights = (obj.insights as unknown[])
      .filter((s) => typeof s === "string")
      .map((s) => sanitizeText(s as string))
      .filter((s) => s.length > 0)
      .slice(0, 8);
  }

  let visualization: LLMVisualization | undefined;
  const rawViz = obj.visualization || (obj as any).config;
  if (shouldVisualize && rawViz && typeof rawViz === "object") {
    const vizObj = (rawViz as Record<string, unknown>).config
      ? ((rawViz as Record<string, unknown>).config as Record<string, unknown>)
      : (rawViz as Record<string, unknown>);

    const type = typeof vizObj.type === "string" ? vizObj.type : "bar";
    const title = typeof vizObj.title === "string" ? vizObj.title : "Chart";
    const description = typeof vizObj.description === "string" ? vizObj.description : undefined;
    const xKey = typeof vizObj.xKey === "string" ? vizObj.xKey : "";
    const unit = typeof vizObj.unit === "string" ? vizObj.unit : undefined;
    const height = typeof vizObj.height === "number" ? vizObj.height : undefined;
    const stacked = typeof vizObj.stacked === "boolean" ? vizObj.stacked : undefined;
    const legend = typeof vizObj.legend === "boolean" ? vizObj.legend : undefined;
    const radarIndicators = Array.isArray(vizObj.radarIndicators)
      ? (vizObj.radarIndicators as RadarIndicator[])
      : undefined;

    const seriesArr = Array.isArray(vizObj.series) ? vizObj.series : [];

    const series: LLMVisualizationSeries[] = seriesArr.map((s: unknown) => {
      const item = (s as Record<string, unknown>) || {};
      return {
        key: typeof item.key === "string" ? item.key : "",
        label: typeof item.label === "string" ? item.label : "Metric",
        color: typeof item.color === "string" ? item.color : undefined,
        chartType:
          item.chartType === "line" || item.chartType === "bar" || item.chartType === "area"
            ? item.chartType
            : undefined,
        dashed: typeof item.dashed === "boolean" ? item.dashed : undefined,
      };
    });

    const vizCandidate: LLMVisualization = {
      type,
      title,
      description,
      xKey,
      unit,
      height,
      stacked,
      legend,
      radarIndicators,
      series,
    };
    const vizResult = validateConfig(vizCandidate);
    if (vizResult.valid) {
      visualization = vizCandidate;
    } else {
      console.warn("[AI] Visualization config invalid:", vizResult.errors?.join(", ") ?? "Unknown error");
    }
  }

  return {
    answerSummary: sanitizeText(answerSummary),
    sqlQuery,
    shouldVisualize: Boolean(visualization),
    visualization,
    insights,
  };
}

export function toVisualizationConfig(
  viz: LLMVisualization
): VisualizationConfig {
  return {
    type: viz.type as VisualizationConfig["type"],
    title: viz.title,
    description: viz.description,
    xKey: viz.xKey,
    unit: viz.unit,
    height: viz.height ?? 300,
    stacked: viz.stacked,
    legend: viz.legend,
    radarIndicators: viz.radarIndicators,
    series: viz.series.map((s) => ({
      key: s.key,
      label: s.label,
      color: s.color,
      chartType: s.chartType,
      dashed: s.dashed,
    })),
    tooltip: { enabled: true, decimals: 2 },
  };
}

export function reconcileVisualization(
  viz: LLMVisualization,
  chartData: DataRecord[]
): { config: VisualizationConfig; data: DataRecord[] } | null {
  if (!chartData || !chartData.length) return null;

  const sampleKeys = new Set(Object.keys(chartData[0]!));

  if (!sampleKeys.has(viz.xKey)) {
    console.warn(`[AI] xKey "${viz.xKey}" not found in chart data. Keys: ${[...sampleKeys].join(", ")}`);
    return null;
  }

  const validSeries = viz.series.filter((s) => sampleKeys.has(s.key));
  if (!validSeries.length) {
    console.warn("[AI] No valid series keys found in chart data");
    return null;
  }

  const config = toVisualizationConfig({ ...viz, series: validSeries });
  return { config, data: chartData };
}

