import { NextResponse } from "next/server";
import { classifyBlocks } from "@/lib/ai/classifier";
import { z } from "zod";
import { sectionBlockSchema } from "@/lib/validation/schemas";

const classifyRequestSchema = z.object({
    url: z.string().url(),
    blocks: z.array(sectionBlockSchema)
});

/**
 * Dispatches unclassified semantic HTML blocks into Anthropic Claude Haiku
 * for strictly formatted response mappings.
 */
export async function POST(req: Request) {
    try {
        const json = await req.json();
        const { url, blocks } = classifyRequestSchema.parse(json);

        const classified = await classifyBlocks(url, blocks);

        return NextResponse.json(classified);

    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
    }
}
