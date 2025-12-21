"use client";

import { useState } from "react";
import type { AIProvider } from "@/lib/ai";

type PlaygroundResult = {
  provider: AIProvider;
  content: string;
};

const providerOptions: { value: AIProvider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "claude", label: "Anthropic Claude" },
  { value: "gemini", label: "Google Gemini" },
  { value: "replicate", label: "Replicate" },
];

export function AiPlayground() {
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [prompt, setPrompt] = useState("AIスタートパックJPの機能を3つ教えて");
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, prompt, temperature }),
      });

      const data = (await response.json()) as { provider?: AIProvider; result?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "AIリクエストに失敗しました");
      }

      setResult({ provider: data.provider ?? provider, content: data.result ?? "" });
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[400px,1fr]">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="provider" className="block text-sm font-semibold text-slate-600">
            AIプロバイダ
          </label>
          <select
            id="provider"
            value={provider}
            onChange={(event) => setProvider(event.target.value as AIProvider)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none"
          >
            {providerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="prompt" className="block text-sm font-semibold text-slate-600">
            プロンプト
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={6}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none"
            placeholder="AIに投げるテキストを入力"
          />
        </div>

        <div>
          <label htmlFor="temperature" className="block text-sm font-semibold text-slate-600">
            Temperature ({temperature.toFixed(1)})
          </label>
          <input
            id="temperature"
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(event) => setTemperature(Number(event.target.value))}
            className="mt-2 w-full"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={loading}
        >
          {loading ? "生成中..." : "AIに質問する"}
        </button>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-500">
          出力結果 {result ? `(via ${providerOptions.find((item) => item.value === result.provider)?.label ?? result.provider})` : ""}
        </h3>
        <div className="mt-3 min-h-[280px] whitespace-pre-wrap rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
          {result ? result.content : "ここにAIのレスポンスが表示されます"}
        </div>
      </div>
    </section>
  );
}
