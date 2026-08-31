import type { DataRecord } from "@/lib/visualization/types";

export interface AIToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AIToolResult {
  toolName: string;
  summary: unknown;
  chartData: DataRecord[];
}

export interface AIProviderRequest {
  systemPrompt: string;
  userMessage: string;
  tools: readonly AIToolDefinition[];
  executeTool: (name: string, args: Record<string, unknown>) => AIToolResult;
}

export interface AIProviderResponse {
  content: string;
  toolResult?: AIToolResult;
}

export interface AIProvider {
  readonly name: string;
  generate(request: AIProviderRequest): Promise<AIProviderResponse>;
}
