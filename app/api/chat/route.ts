/**
 * Provider-independent chat route for Text-to-SQL Sales BI Assistant.
 */

import { type NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/ai/systemPrompt";
import { GeminiProvider } from "@/lib/ai/geminiProvider";
import { executeSalesQuery } from "@/lib/data/sales/salesService";
import {
  validateLLMResponse,
  reconcileVisualization,
  type ChatApiResponse,
} from "@/lib/ai/llmResponseSchema";
import type { DataRecord } from "@/lib/visualization/types";

interface ChatRequestBody {
  message: string;
}

function parseBody(body: unknown): ChatRequestBody | null {
  if (typeof body !== "object" || body === null) return null;
  const value = body as Record<string, unknown>;
  if (typeof value.message !== "string" || !value.message.trim()) return null;
  return {
    message: value.message.trim().slice(0, 800),
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = "GEMINI_API_KEY is missing from the server environment.";
    console.error(`[/api/chat] missing_api_key: ${error}`);
    return Response.json({ error, category: "missing_api_key" }, { status: 503 });
  }

  const provider = new GeminiProvider(apiKey);
  try {
    const result = await provider.generate({
      systemPrompt: buildSystemPrompt(),
      userMessage: parsed.message,
    });

    const response = validateLLMResponse(result.content);
    let queryData: DataRecord[] = [];
    if (response.sqlQuery) {
      try {
        queryData = executeSalesQuery(response.sqlQuery);
      } catch (sqlErr) {
        console.warn(`[/api/chat] SQL execution warning: ${(sqlErr as Error).message}`);
      }
    }

    let visualization: ChatApiResponse["visualization"];
    if (response.shouldVisualize && response.visualization && queryData.length > 0) {
      visualization = reconcileVisualization(
        response.visualization,
        queryData
      ) ?? undefined;
    }

    return Response.json({
      answer: response.answerSummary,
      sqlQuery: response.sqlQuery,
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
