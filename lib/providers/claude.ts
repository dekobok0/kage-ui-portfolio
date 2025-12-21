import Anthropic from "@anthropic-ai/sdk";
import type { AIResponse } from "../ai";

type ClaudeRequest = {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
};

const apiKey = process.env.CLAUDE_API_KEY;

if (!apiKey) {
  console.warn("CLAUDE_API_KEY is not set. Claude provider will throw when used.");
}

const client = apiKey
  ? new Anthropic({ apiKey })
  : null;

export async function callClaude({
  prompt,
  temperature = 0.7,
  maxTokens,
  systemPrompt,
}: ClaudeRequest): Promise<AIResponse> {
  if (!client) {
    throw new Error("Claude provider is not configured. Set CLAUDE_API_KEY in your environment.");
  }

  const model = process.env.CLAUDE_MODEL ?? "claude-3-haiku-20240307";
  const maxOutputTokens = maxTokens ?? 1024;

  const response = await client.messages.create({
    model,
    max_tokens: maxOutputTokens,
    temperature,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");

  return {
    content,
    raw: response,
  };
}
