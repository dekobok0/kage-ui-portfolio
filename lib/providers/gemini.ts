import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import type { AIResponse } from "../ai";

type GeminiRequest = {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
};

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. Gemini provider will throw when used.");
}

const client = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function callGemini({
  prompt,
  temperature = 0.7,
  maxTokens,
  systemPrompt,
}: GeminiRequest): Promise<AIResponse> {
  if (!client) {
    throw new Error("Gemini provider is not configured. Set GEMINI_API_KEY in your environment.");
  }

  const modelName = process.env.GEMINI_MODEL ?? "gemini-1.5-pro";

  // --- ▼▼▼ ここからが修正部分 ▼▼▼ ---
  // 'systemInstruction' は 'string' ではなく 'Content' オブジェクトを要求する
  const systemInstruction: Content | undefined = systemPrompt
    ? { parts: [{ text: systemPrompt }], role: "system" } // 'role: "system"' も追加
    : undefined;

  const model = client.getGenerativeModel({
    model: modelName,
    // 'systemInstruction' を正しくオブジェクトとして渡す
    ...(systemInstruction ? { systemInstruction } : {}),
  });
  // --- ▲▲▲ ここまでが修正部分 ▲▲▲ ---

  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      ...(maxTokens ? { maxOutputTokens: maxTokens } : {}),
    },
  });

  const content = response.response.text();

  return {
    content,
    raw: response,
  };
}