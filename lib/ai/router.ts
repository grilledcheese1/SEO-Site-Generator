import { Anthropic } from "@anthropic-ai/sdk";

// Ensure Anthropic API key is available
if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY is missing from environment variables.");
}

// Single Anthropic client instance
const globalForAnthropic = global as unknown as { anthropic: Anthropic };

export const anthropic =
    globalForAnthropic.anthropic ||
    new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || "missing",
    });

if (process.env.NODE_ENV !== "production") globalForAnthropic.anthropic = anthropic;

/**
 * A centralized wrapper to call Claude, enforcing models.
 */
export async function callClaude({
    model = "claude-3-5-sonnet-20241022",
    system,
    messages,
    temperature = 0.5,
    max_tokens = 4096,
}: {
    model?: "claude-3-5-haiku-20241022" | "claude-3-5-sonnet-20241022";
    system?: string;
    messages: Anthropic.MessageParam[];
    temperature?: number;
    max_tokens?: number;
}) {
    return anthropic.messages.create({
        model,
        system,
        messages,
        max_tokens,
        temperature,
    });
}
