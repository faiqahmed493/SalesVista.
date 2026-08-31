import { GoogleGenAI } from "@google/genai";
import type {
  AIProvider,
  AIProviderRequest,
  AIProviderResponse,
} from "@/lib/ai/provider";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
const MAX_OUTPUT_TOKENS = 1800;
const TEMPERATURE = 0.15;

function getText(response: unknown): string {
  const text = (response as { text?: string }).text;
  if (typeof text === "string" && text.trim()) return text;

  const parts = (response as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
    .candidates?.[0]?.content?.parts;
  return parts?.map((part) => part.text ?? "").join("").trim() ?? "";
}

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  private readonly client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    const tools = [
      {
        functionDeclarations: request.tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parametersJsonSchema: tool.parameters,
        })),
      },
    ];

    const firstResponse = await this.client.models.generateContent({
      model: MODEL,
      contents: request.userMessage,
      config: {
        systemInstruction: request.systemPrompt,
        temperature: TEMPERATURE,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        tools,
      },
    });

    const functionCall = firstResponse.functionCalls?.[0];
    if (!functionCall?.name) {
      return { content: getText(firstResponse) };
    }

    const toolResult = request.executeTool(
      functionCall.name,
      (functionCall.args ?? {}) as Record<string, unknown>
    );

    const modelParts = firstResponse.candidates?.[0]?.content?.parts ?? [
      { functionCall },
    ];
    const secondResponse = await this.client.models.generateContent({
      model: MODEL,
      contents: [
        { role: "user", parts: [{ text: request.userMessage }] },
        { role: "model", parts: modelParts },
        {
          role: "user",
          parts: [
            {
              functionResponse: {
                name: functionCall.name,
                response: toolResult.summary,
              },
            },
          ],
        },
      ] as never,
      config: {
        systemInstruction: request.systemPrompt,
        temperature: TEMPERATURE,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        responseMimeType: "application/json",
      },
    });

    return { content: getText(secondResponse), toolResult };
  }
}

export { MODEL as GEMINI_MODEL };
