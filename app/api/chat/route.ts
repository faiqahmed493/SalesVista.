/**
 * Provider-independent chat route.
 *
 * Browser -> this route -> AI provider -> validated ChatApiResponse.
 * The provider and API key always remain server-side.
 */

import { type NextRequest } from "next/server";
import { getWeather } from "@/lib/data/weather/weatherService";
import { getMockResponse } from "@/lib/ai/mockEngine";
import { buildSystemPrompt } from "@/lib/ai/systemPrompt";
import {
  AI_TOOL_DEFINITIONS,
  executeTool,
  type ToolArgs,
  type ToolName,
} from "@/lib/ai/weatherDataTools";
import { GeminiProvider } from "@/lib/ai/geminiProvider";
import {
  validateLLMResponse,
  reconcileVisualization,
  type ChatApiResponse,
} from "@/lib/ai/llmResponseSchema";

interface ChatRequestBody {
  message: string;
  locationId?: string;
}

function parseBody(body: unknown): ChatRequestBody | null {
  if (typeof body !== "object" || body === null) return null;
  const value = body as Record<string, unknown>;
  if (typeof value.message !== "string" || !value.message.trim()) return null;
  return {
    message: value.message.trim().slice(0, 800),
    locationId: typeof value.locationId === "string" ? value.locationId : undefined,
  };
}

function mockResponse(
  message: string,
  data: import("@/lib/data/weather/weatherTypes").WeatherDashboardData
): ChatApiResponse {
  const payload = getMockResponse(message, data);
  return {
    answer: payload.content,
    shouldVisualize: !!payload.visualization,
    visualization: payload.visualization,
    insights: payload.insights,
    canAddToDashboard: !!payload.visualization,
    mode: "mock",
  };
}

function classifyGeminiError(error: unknown, model: string) {
  const message = error instanceof Error ? error.message : "Unknown Gemini error.";
  const status = typeof (error as { status?: unknown })?.status === "number"
    ? (error as { status: number }).status
    : 502;
  const lower = message.toLowerCase();

  if (status === 401 || status === 403 || lower.includes("api key") || lower.includes("authentication")) {
    return { category: "authentication_error", status: 401, message: "Gemini rejected the API key." };
  }
  if (status === 429 || lower.includes("quota") || lower.includes("resource exhausted")) {
    return { category: lower.includes("quota") ? "insufficient_quota" : "rate_limit", status: 429, message: "Gemini quota or rate limit was reached." };
  }
  if (status === 400 && (lower.includes("model") || lower.includes("not found"))) {
    return { category: "invalid_model", status: 400, message: `Gemini does not recognize model ${model}.` };
  }
  if (status === 400) {
    return { category: "malformed_request", status: 400, message: "Gemini rejected the request." };
  }
  return { category: "api_error", status, message };
}

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseBody(body);
  if (!parsed) {
    return Response.json(
      { error: "message is required and must be a non-empty string" },
      { status: 400 }
    );
  }

  const weatherResult = await getWeather({ locationId: parsed.locationId });
  if (!weatherResult.success) {
    return Response.json(
      { error: "Unable to load weather data for this location.", category: "weather_data_error" },
      { status: 502 }
    );
  }

  const weatherData = weatherResult.data;
  if (process.env.AI_PROVIDER === "mock") {
    return Response.json(mockResponse(parsed.message, weatherData));
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = "GEMINI_API_KEY is missing from the server environment.";
    console.error(`[/api/chat] missing_api_key: ${error}`);
    return Response.json({ error, category: "missing_api_key" }, { status: 503 });
  }

  const provider = new GeminiProvider(apiKey);
  try {
    const result = await provider.generate({
      systemPrompt: buildSystemPrompt(weatherData),
      userMessage: parsed.message,
      tools: AI_TOOL_DEFINITIONS,
      executeTool: (name, args) =>
        executeTool(name as ToolName, args as ToolArgs, weatherData),
    });

    const response = validateLLMResponse(result.content);
    let visualization: ChatApiResponse["visualization"];
    if (response.shouldVisualize && response.visualization && result.toolResult) {
      visualization = reconcileVisualization(
        response.visualization,
        result.toolResult.chartData
      ) ?? undefined;
    }

    return Response.json({
      answer: response.answer,
      shouldVisualize: !!visualization,
      visualization,
      insights: response.insights,
      canAddToDashboard: !!visualization,
      mode: "live",
    } satisfies ChatApiResponse);
  } catch (error) {
    const model = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
    const classified = classifyGeminiError(error, model);
    console.error(`[/api/chat] ${classified.category}: ${classified.message}`);
    return Response.json(
      { error: classified.message, category: classified.category },
      { status: classified.status }
    );
  }
}
