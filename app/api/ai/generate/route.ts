import { NextResponse } from "next/server";
import { generateAIResponse, type AIProvider } from "@/lib/ai";

type RequestPayload = {
  provider?: AIProvider;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
};

const defaultProvider = (process.env.DEFAULT_AI_PROVIDER as AIProvider) ?? "openai";

export async function POST(req: Request) {
  let payload: RequestPayload;

  try {
    payload = (await req.json()) as RequestPayload;
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON body", details: String(error) },
      { status: 400 },
    );
  }

  const provider = payload.provider ?? defaultProvider;
  const prompt = payload.prompt;

  if (!prompt) {
    return NextResponse.json(
      { error: "Missing 'prompt' in request body" },
      { status: 400 },
    );
  }

  try {
    const response = await generateAIResponse({
      provider,
      prompt,
      temperature: payload.temperature,
      maxTokens: payload.maxTokens,
      systemPrompt: payload.systemPrompt,
    });

    return NextResponse.json({
      provider,
      result: response.content,
      raw: response.raw,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
