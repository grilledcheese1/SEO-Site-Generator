import { callClaude } from "./router";
import { buildThemePrompt } from "./prompts/theme";
import { getCached, setCached } from "../cache/redis";
import { cacheKeys, CACHE_TTL } from "../cache/keys";
import type { SectionBlock } from "../validation/schemas";

export type ThemeResponse = {
  head: string;
  body: string;
};

/**
 * Generates an HTML document leveraging the classified content via Claude Sonnet.
 * It caches the generated output bound to the request's exact footprint.
 */
export async function generateTheme(
  classifiedBlocks: SectionBlock[],
  themeStyle: string,
  tone: string,
  seoGoals: string
): Promise<ThemeResponse | null> {
  const requestDetails = `${themeStyle}-${tone}-${seoGoals}`;
  const blockHash = classifiedBlocks.map(b => `${b.id}:${b.type}`).join("|");

  const cacheKey = cacheKeys.generatedTheme(requestDetails, blockHash);

  // 1. Check Cache
  const cached = await getCached<ThemeResponse>(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] Generated Theme loaded from Redis`);
    return cached;
  }

  console.log(`[Cache Miss] Generating theme via Claude Sonnet`);

  // 2. Build Prompt
  const system = buildThemePrompt(classifiedBlocks);
  const userText = `Theme Style: ${themeStyle}\nTone: ${tone}\nSEO Goals: ${seoGoals}\nGenerate the HTML.`;

  // 3. Call Claude Sonnet
  const response = await callClaude({
    model: "claude-3-5-sonnet-20241022",
    system,
    messages: [{ role: "user", content: userText }],
    temperature: 0.6,
    max_tokens: 8192,
  });

  const textOutput = (response.content[0] as { text: string }).text;

  try {
    const parsedGeneration = JSON.parse(textOutput) as ThemeResponse;

    // 4. Set Cache
    await setCached(cacheKey, parsedGeneration, CACHE_TTL.GENERATED_THEMES);

    return parsedGeneration;

  } catch (e: unknown) {
    console.error("Failed to parse Sonnet theme JSON response", e);
    return null;
  }
}
