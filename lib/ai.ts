import { callOpenAI } from "./providers/openai";
import { callClaude } from "./providers/claude";
import { callGemini } from "./providers/gemini";
import { callReplicate } from "./providers/replicate";

export type AIProvider = "openai" | "claude" | "gemini" | "replicate";

export interface AIRequest {
  provider: AIProvider;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  content: string;
  raw?: unknown;
}

type ProviderHandler = (request: Omit<AIRequest, "provider">) => Promise<AIResponse>;

const providerHandlers: Record<AIProvider, ProviderHandler> = {
  openai: callOpenAI,
  claude: callClaude,
  gemini: callGemini,
  replicate: callReplicate,
};

export async function generateAIResponse(request: AIRequest): Promise<AIResponse> {
  const handler = providerHandlers[request.provider];
  if (!handler) {
    throw new Error(`AI provider '${request.provider}' is not supported`);
  }

  return handler({
    prompt: request.prompt,
    temperature: request.temperature,
    maxTokens: request.maxTokens,
    systemPrompt: request.systemPrompt,
  });
}
