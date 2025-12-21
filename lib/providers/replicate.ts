import Replicate from "replicate";
import type { AIResponse } from "../ai";

type ReplicateRequest = {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
};

const apiToken = process.env.REPLICATE_API_TOKEN;

if (!apiToken) {
  console.warn("REPLICATE_API_TOKEN is not set. Replicate provider will throw when used.");
}

const client = apiToken ? new Replicate({ auth: apiToken }) : null;

export async function callReplicate({
  prompt,
  temperature = 0.7,
  maxTokens,
  systemPrompt,
}: ReplicateRequest): Promise<AIResponse> {
  if (!client) {
    throw new Error("Replicate provider is not configured. Set REPLICATE_API_TOKEN in your environment.");
  }

  // --- ▼▼▼ ここからが修正部分 ▼▼▼ ---
  // 'model' にバージョンハッシュを含む完全な識別子を指定する
  const model =
    process.env.REPLICATE_MODEL ??
    "meta/meta-llama-3-8b-instruct:8345d225f1b8780c78c8f58b38a37f8841031c605ae6ae003460723661b3b6c5";
  
  // 'model' を 'run' の第一引数に渡す（型アサーション）
  const modelId = model as `${string}/${string}:${string}`;
  // --- ▲▲▲ ここまでが修正部分 ▲▲▲ ---

  const input: Record<string, unknown> = {
    prompt,
    temperature,
  };

  if (maxTokens) {
    input.max_tokens = maxTokens;
  }

  if (systemPrompt) {
    input.system_prompt = systemPrompt;
  }

  const response = (await client.run(modelId, { input })) as unknown; // 'model' を 'modelId' に変更

  let content = "";

  if (Array.isArray(response)) {
    content = response
      .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
      .join("");
  } else if (typeof response === "string") {
    content = response;
  } else {
    content = JSON.stringify(response);
  }

  return {
    content,
    raw: response,
  };
}