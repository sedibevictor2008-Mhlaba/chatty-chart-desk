import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import type { z } from "zod";

const MODEL = "openai/gpt-6-astra";
const RUN_ID = "X-Lovable-AIG-Run-ID";

function provider() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured.");
  let runId: string | undefined;
  return createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(RUN_ID)) headers.set(RUN_ID, runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get(RUN_ID)?.trim() || undefined;
      return res;
    },
  });
}

const providerOptions = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
};

function friendly(err: unknown): Error {
  const e = err as { statusCode?: number; message?: string };
  const status = e?.statusCode;
  if (status === 429) return new Error("Too many requests right now. Please wait a moment and try again.");
  if (status === 402) return new Error("AI credits are used up. Add credits in your workspace billing settings.");
  if (status === 403) return new Error("AI access is blocked for this workspace.");
  return new Error(e?.message || "The AI request failed. Please try again.");
}

export async function aiText(system: string, prompt: string) {
  try {
    const result = streamText({
      model: provider().responses(MODEL),
      system,
      prompt,
      providerOptions,
      onError: () => {},
    });
    return await result.text;
  } catch (err) {
    throw friendly(err);
  }
}

export async function aiObject<T>(system: string, prompt: string, schema: z.ZodType<T>) {
  try {
    const result = streamText({
      model: provider().responses(MODEL),
      system,
      prompt,
      providerOptions,
      output: Output.object({ schema }),
      onError: () => {},
    });
    return (await result.output) as T;
  } catch (err) {
    throw friendly(err);
  }
}
