import { NextResponse } from "next/server";
import { generateTheme } from "@/lib/ai/theme-generator";
import { getCachedTemplateByNiche } from "@/lib/db/templates";
import { z } from "zod";
import { sectionBlockSchema } from "@/lib/validation/schemas";

const themeRequestSchema = z.object({
    tier: z.enum(["FREE", "STARTER", "PRO"]).default("FREE"),
    classifiedBlocks: z.array(sectionBlockSchema),
    themeStyle: z.string(),
    tone: z.string(),
    seoGoals: z.string(),
    niche: z.string().optional()
});

/**
 * Gatekeeps template response based on user Tier plan structure.
 * FREE users receive Database cached templates. PRO users trigger full LLM custom generation.
 */
export async function POST(req: Request) {
    try {
        const json = await req.json();
        const data = themeRequestSchema.parse(json);

        if (data.tier === "FREE") {
            // Shortcircuit logic to basic DB lookup for non-paying requests
            const fallbackNiche = data.niche || "Enterprise";
            const cachedDbTheme = await getCachedTemplateByNiche(fallbackNiche);

            if (cachedDbTheme) {
                return NextResponse.json({
                    head: "<style>/* Cached free theme proxy */</style>",
                    body: cachedDbTheme.html
                });
            }
        }

        // PRO logic generating complex personalized layout utilizing Anthropic Sonnet
        const aiTheme = await generateTheme(data.classifiedBlocks, data.themeStyle, data.tone, data.seoGoals);

        if (!aiTheme) throw new Error("AI Engine failed to generate layout.");

        return NextResponse.json(aiTheme);

    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
    }
}
