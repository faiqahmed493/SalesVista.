export interface AIProviderRequest {
  systemPrompt: string;
  userMessage: string;
}

export interface AIProviderResponse {
  content: string;
}

export interface AIProvider {
  readonly name: string;
  generate(request: AIProviderRequest): Promise<AIProviderResponse>;
}
