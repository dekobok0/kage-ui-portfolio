import OpenAI from "openai";
import type { AIResponse } from "../ai";

type OpenAIRequest = {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
};

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("OPENAI_API_KEY is not set. OpenAI provider will throw when used.");
}

const client = apiKey
  ? new OpenAI({ apiKey })
  : null;

export async function callOpenAI({
  prompt,
  temperature = 0.7,
  maxTokens,
  systemPrompt,
}: OpenAIRequest): Promise<AIResponse> {
  if (!client) {
    throw new Error("OpenAI provider is not configured. Set OPENAI_API_KEY in your environment.");
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const messages = [
    ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
    { role: "user" as const, content: prompt },
  ];

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature,
    ...(maxTokens ? { max_tokens: maxTokens } : {}),
  });

  const content = response.choices[0]?.message?.content ?? "";

  return {
    content,
    raw: response,
  };
}
