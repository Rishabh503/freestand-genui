import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

interface FallbackCandidate {
  keyName: string;
  apiKey: string;
  modelName: string;
}

export interface GeminiInvokeOptions {
  temperature?: number;
  maxRetries?: number;
}

/**
 * Retrieves configured Gemini API keys (Key 1 and Key 2).
 */
export function getGeminiKeys(): { key1: string | undefined; key2: string | undefined } {
  const key1 = process.env.GEMINI_KEY || process.env.GEMINI_KEY_1 || process.env.GEMINI_API_KEY_1;
  const key2 = process.env.GEMINI_KEY_2 || process.env.GEMINI_API_KEY_2;
  return { key1, key2 };
}

/**
 * Retrieves configured Gemini model identifiers.
 * Model 1 defaults to gemini-3.5-flash-lite (High-quota, ultra-fast generation <2s)
 * Model 2 defaults to gemini-flash-lite-latest (Reliable fallback)
 */
export function getGeminiModels(): { model1: string; model2: string } {
  const model1 = process.env.GEMINI_MODEL_1 || "gemini-3.5-flash-lite";
  const model2 = process.env.GEMINI_MODEL_2 || "gemini-flash-lite-latest";
  return { model1, model2 };
}

/**
 * Builds candidate list across available keys and models.
 * Prioritizes:
 * 1. Key 1 -> Model 1 (Primary Key, Primary Model)
 * 2. Key 2 -> Model 1 (Secondary Key, Primary Model)
 * 3. Key 1 -> Model 2 (Primary Key, Backup Model)
 * 4. Key 2 -> Model 2 (Secondary Key, Backup Model)
 */
export function getFallbackCandidates(): FallbackCandidate[] {
  const { key1, key2 } = getGeminiKeys();
  const { model1, model2 } = getGeminiModels();

  const keys: { name: string; key: string }[] = [];
  if (key1) keys.push({ name: "GEMINI_KEY_1", key: key1 });
  if (key2) keys.push({ name: "GEMINI_KEY_2", key: key2 });

  if (keys.length === 0) {
    throw new Error("No Gemini API keys found. Please set GEMINI_KEY (or GEMINI_KEY_1 and GEMINI_KEY_2) in your .env.local file.");
  }

  const models = [model1];
  if (model2 && model2 !== model1) {
    models.push(model2);
  }

  const candidates: FallbackCandidate[] = [];

  // 1. First try all available keys on the primary model
  for (const k of keys) {
    candidates.push({
      keyName: k.name,
      apiKey: k.key,
      modelName: models[0],
    });
  }

  // 2. If secondary model exists, try all keys on the secondary model
  if (models.length > 1) {
    for (const k of keys) {
      candidates.push({
        keyName: k.name,
        apiKey: k.key,
        modelName: models[1],
      });
    }
  }

  return candidates;
}

/**
 * Executes a LangChain model invocation with automated fallback across 2 keys and 2 models.
 * Only if all combinations fail is a "Service Busy" error raised.
 */
export async function invokeGeminiWithFallback(
  messages: any[],
  options: GeminiInvokeOptions = {}
): Promise<any> {
  const candidates = getFallbackCandidates();
  const temperature = options.temperature ?? 0.7;
  const errors: { candidate: string; error: string }[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const candidateTag = `[Candidate ${i + 1}/${candidates.length}: ${candidate.keyName} + ${candidate.modelName}]`;

    try {
      // console.log(`Attempting AI call with ${candidateTag}...`);
      const model = new ChatGoogleGenerativeAI({
        apiKey: candidate.apiKey,
        model: candidate.modelName,
        temperature,
        maxRetries: 0, // Immediately fail over to next key/model without hanging on 429 retries
      });

      const response = await model.invoke(messages);
      return response;
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.warn(`⚠️ ${candidateTag} failed with error:`, errMsg);

      errors.push({
        candidate: `${candidate.keyName} (${candidate.modelName})`,
        error: errMsg,
      });

      // Continue to next candidate
    }
  }

  // If we reach here, all key/model combinations were exhausted
  console.error("❌ All Gemini keys and models failed. Summary of errors:", errors);
  throw new Error(
    "The AI service is currently busy or experiencing high traffic across all API keys and backup models. Please try again in a few moments."
  );
}
