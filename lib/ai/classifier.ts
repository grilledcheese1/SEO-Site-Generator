import { callClaude } from "./router";
import { buildClassificationPrompt } from "./prompts/classify";
import { getCached, setCached } from "../cache/redis";
import { cacheKeys, CACHE_TTL } from "../cache/keys";
import type { SectionBlock } from "../validation/schemas";

/**
 * Classifies blocks using Claude 3 Haiku for speed and low cost.
 * It checks Redis to see if the URL's blocks were already classified previously.
 */
export async function classifyBlocks(url: string, blocks: SectionBlock[]): Promise<SectionBlock[]> {
  const cacheKey = cacheKeys.classifiedBlocks(url);

  // 1. Check Cache
  const cached = await getCached<SectionBlock[]>(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] Classified blocks loaded from Redis for ${url}`);
    return cached;
  }

  console.log(`[Cache Miss] Classifying blocks via Claude Haiku for ${url}`);

  // 2. Build Prompt
  const system = buildClassificationPrompt();
  const userText = `Classify these blocks:\n\n${JSON.stringify(blocks)}`;

  // 3. Call Claude Haiku
  const response = await callClaude({
    model: "claude-3-5-haiku-20241022",
    system,
    messages: [{ role: "user", content: userText }],
    temperature: 0,
    max_tokens: 2000,
  });

  const textOutput = (response.content[0] as { text: string }).text;

  try {
    const rawClassifications = JSON.parse(textOutput);

    // Quick zip merge
    const classifiedResponse = blocks.map(b => {
      const match = rawClassifications.find((rc: { id: string, classification: string }) => rc.id === b.id);
      return {
        ...b,
        type: match?.classification || "text"
      };
    }) as SectionBlock[];

    // 4. Set Cache
    await setCached(cacheKey, classifiedResponse, CACHE_TTL.CLASSIFIED_BLOCKS);

    return classifiedResponse;

  } catch (e: unknown) {
    console.error("Failed to parse Haiku classification JSON response", e);
    return blocks as SectionBlock[]; // Fallback
  }
}
