import OpenAI from "openai";

const DEFAULT_ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/plan/v3";
const DEFAULT_ARK_MODEL = "doubao-seed-2-0-code-preview-260215";

export const ARK_CHAT_MODEL =
  process.env.ARK_CHAT_MODEL ?? DEFAULT_ARK_MODEL;

export function createArkClient() {
  const apiKey = process.env.ARK_API_KEY;

  if (!apiKey) {
    throw new Error("ARK_API_KEY is not set. LLM features will not work.");
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.ARK_BASE_URL ?? DEFAULT_ARK_BASE_URL,
  });
}

function stripMarkdownFence(content: string) {
  return content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
}

function firstJsonCandidate(content: string) {
  const objectMatch = content.match(/\{[\s\S]*\}/);
  const arrayMatch = content.match(/\[[\s\S]*\]/);

  if (!objectMatch) return arrayMatch?.[0];
  if (!arrayMatch) return objectMatch[0];

  const objectIndex = objectMatch.index ?? Number.MAX_SAFE_INTEGER;
  const arrayIndex = arrayMatch.index ?? Number.MAX_SAFE_INTEGER;

  return objectIndex < arrayIndex ? objectMatch[0] : arrayMatch[0];
}

export function parseJsonFromModel(content: string): unknown {
  const normalized = stripMarkdownFence(content);

  try {
    return JSON.parse(normalized);
  } catch {
    const candidate = firstJsonCandidate(normalized);
    if (!candidate) {
      throw new Error("Model response did not include JSON");
    }
    return JSON.parse(candidate);
  }
}
