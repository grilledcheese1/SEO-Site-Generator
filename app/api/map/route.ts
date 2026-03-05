import { NextResponse } from "next/server";
import { orchestrateMapping } from "@/lib/mapping";
import { z } from "zod";
import { sectionBlockSchema } from "@/lib/validation/schemas";

const mapRequestSchema = z.object({
    templateHtml: z.string(),
    blocks: z.array(sectionBlockSchema)
});

/**
 * Handles inserting extracted blocks accurately into the designated fallback templates
 * via slot syntax {{block_type.field}}
 */
export async function POST(req: Request) {
    try {
        const json = await req.json();
        const { templateHtml, blocks } = mapRequestSchema.parse(json);

        const mappedHtml = orchestrateMapping(templateHtml, blocks);

        return NextResponse.json({ html: mappedHtml });
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
    }
}
