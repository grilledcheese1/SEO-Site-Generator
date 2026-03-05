import { NextResponse } from "next/server";
import { optimizeSEO } from "@/lib/seo/optimizer";
import { injectSEO } from "@/lib/seo/injector";
import { z } from "zod";

const seoRequestSchema = z.object({
    headHtml: z.string(),
    seoGoals: z.string().optional(),
    rawSeo: z.object({
        title: z.string(),
        description: z.string(),
        url: z.string(),
        canonical: z.string().optional()
    })
});

/**
 * Bounds raw scraped SEO data to Lighthouse limits and forcibly injects it 
 * into the AI-generated head strings.
 */
export async function POST(req: Request) {
    try {
        const json = await req.json();
        const { headHtml, rawSeo, seoGoals } = seoRequestSchema.parse(json);

        const safeSeo = optimizeSEO(rawSeo);
        const finalizedHead = injectSEO(headHtml, safeSeo);

        return NextResponse.json({ head: finalizedHead });
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
    }
}
