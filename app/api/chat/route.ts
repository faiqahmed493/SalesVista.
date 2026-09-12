/**
 * Provider-independent chat route for Text-to-SQL Sales BI Assistant with automatic Key Rotation.
 */

import { type NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/ai/systemPrompt";
import { executeSalesQuery } from "@/lib/data/sales/salesService";
import {
  validateLLMResponse,
  reconcileVisualization,
  type ChatApiResponse,
} from "@/lib/ai/llmResponseSchema";
import type { DataRecord } from "@/lib/visualization/types";
import { getSession } from "@/lib/auth/session";


interface ChatRequestBody {
  message: string;
}

interface ProviderResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  choices?: { message?: { content?: string } }[];
}

interface ProviderConfig {
  name: string;
  url: string;
  key: string | undefined;
  type: "gemini" | "openai-compatible";
  bodyBuilder: (system: string, user: string) => Record<string, unknown>;
  parseResponse: (data: ProviderResponse) => string | undefined;
}

const configuredGroqModel = process.env.GROQ_MODEL;
const groqModel =
  configuredGroqModel === "llama-3.1-8b-instant" ||
  configuredGroqModel === "llama-3.3-70b-versatile"
    ? "openai/gpt-oss-20b"
    : configuredGroqModel ?? "openai/gpt-oss-20b";

// 1. Define the uniform Multi-Provider Configuration Pool
const PROVIDER_POOL: ProviderConfig[] = [
   {
    name: "Groq Llama 3.1 8B (Backup 1)",
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: process.env.GROQ_API_KEY,
    type: "openai-compatible",
    bodyBuilder: (system: string, user: string) => ({
      model: groqModel,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    }),
    parseResponse: (data) => data.choices?.[0]?.message?.content
  },
   {
    name: "OpenRouter Free Router (Backup 2)",
    url: "https://openrouter.ai/api/v1/chat/completions",
    key: process.env.OPENROUTER_API_KEY,
    type: "openai-compatible",
    bodyBuilder: (system: string, user: string) => ({
      model: process.env.OPENROUTER_MODEL ?? "openrouter/free",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    }),
    parseResponse: (data) => data.choices?.[0]?.message?.content
  },
  {
    name: "Gemini Flash (Primary)",
    url: `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL ?? "gemini-2.5-flash"}:generateContent`,
    key: process.env.GEMINI_API_KEY,
    type: "gemini",
    // Formats the inputs specifically for Gemini's API format
    bodyBuilder: (system: string, user: string) => ({
      contents: [{ parts: [{ text: `${system}\n\nUser Question: ${user}` }] }]
    }),
    parseResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text
  }
];

function parseBody(body: unknown): ChatRequestBody | null {
  if (typeof body !== "object" || body === null) return null;
  const value = body as Record<string, unknown>;
  if (typeof value.message !== "string" || !value.message.trim()) return null;
  return { message: value.message.trim().slice(0, 800) };
}

export async function POST(request: NextRequest): Promise<Response> {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  console.log('\n [1. USER REQUEST]:', parsed.message);
  console.log(' [2. SCHEMA INJECTED]: DDL prompt prepared (Zero row data exposed).');

  const systemPrompt = buildSystemPrompt();
  let rawLLMContent = "";
  let successfulProvider = "";

  // 2. Loop through our available providers to fetch generation text
  for (let i = 0; i < PROVIDER_POOL.length; i++) {
    const config = PROVIDER_POOL[i];
    if (!config.key) {
      console.warn(`⚠️ Skipped provider ${config.name} (Key missing from .env)`);
      continue;
    }

    try {
      console.log(`📡 [ROUTER]: Attempting generation via: ${config.name}...`);
      
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (config.type === "gemini") {
        headers["x-goog-api-key"] = config.key;
      } else {
        headers["Authorization"] = `Bearer ${config.key}`;
      }

      const response = await fetch(config.url, {
        method: "POST",
        headers,
        body: JSON.stringify(config.bodyBuilder(systemPrompt, parsed.message)),
      });

      // Catch rate limits (429) or invalid keys (401) to force fallback rotation
      if (response.status === 429 || response.status === 401) {
        console.warn(`🔄 [ROUTER FAILOVER]: ${config.name} returned status ${response.status}. Rotating...`);
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody.slice(0, 300)}`);
      }

      const data = await response.json();
      const text = config.parseResponse(data);

      if (text) {
        rawLLMContent = text;
        successfulProvider = config.name;
        break; // Successfully got text output! Break loop.
      }
    } catch (err) {
      console.error(`❌ [ROUTER ERROR]: Failed during execution with ${config.name}:`, err);
      // Fall through to next available engine index
    }
  }

  // If the loop finished without populating rawLLMContent, everything failed
  if (!rawLLMContent) {
    return Response.json(
      { error: "All configured LLM providers were rate-limited or exhausted.", category: "insufficient_quota" },
      { status: 503 }
    );
  }

  try {
    console.log(`🤖 [3. LLM RAW RESPONSE] (Via ${successfulProvider}):`, rawLLMContent);
    const response = validateLLMResponse(rawLLMContent);
    console.log('🤖 [3. LLM GENERATED SQL]:', response.sqlQuery);
    console.log('📊 [3b. PROPOSED VIZ CONFIG]:', JSON.stringify(response.visualization, null, 2));
    
    let queryData: DataRecord[] = [];
    if (response.sqlQuery) {
      try {
        console.log('⚡ [4. SQL EXECUTION]: Executing query against SQLite (sales.db)...');
        queryData = await executeSalesQuery(response.sqlQuery);
        console.log(`✅ [5. DB RESULT]: Retrieved ${queryData.length} rows.`);
      } catch (sqlErr) {
        console.warn(`[/api/chat] SQL execution warning: ${(sqlErr as Error).message}`);
      }
    }

    let visualization: ChatApiResponse["visualization"];
    if (response.shouldVisualize && response.visualization && queryData.length > 0) {
      visualization = reconcileVisualization(response.visualization, queryData) ?? undefined;
    }
    
    console.log('className [6. RECONCILIATION]: Validating chart keys match returned DB columns ->', visualization ? 'SUCCESS' : 'FAILED / NO CHART');
    console.log('🏁 [7. PIPELINE COMPLETE]: Sending ChatApiResponse to frontend.\n');

    return Response.json({
      answer: response.answerSummary,
      sqlQuery: response.sqlQuery,
      queryData,
      shouldVisualize: !!visualization,
      visualization,
      insights: response.insights,
      canAddToDashboard: !!visualization,
      mode: "live",
    } satisfies ChatApiResponse);

  } catch {
    console.error(`[/api/chat] Schema validation or post-processing pipeline failed.`);
    return Response.json(
      { error: "Failed to parse structured response from current provider.", category: "malformed_request" },
      { status: 400 }
    );
  }
}
