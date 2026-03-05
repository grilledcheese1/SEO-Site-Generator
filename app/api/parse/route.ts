import { NextResponse } from "next/server";
import { parsePage } from "@/lib/parser";
import { getCached, setCached } from "@/lib/cache/redis";
import { cacheKeys, CACHE_TTL } from "@/lib/cache/keys";
import { z } from "zod";

const parseRequestSchema = z.object({
    url: z.string().url()
});

/**
 * Validates request, checks redis cache, fetches HTML, and returns deeply parsed schema block
 */
export async function POST(req: Request) {
    try {
        const json = await req.json();
        const { url } = parseRequestSchema.parse(json);

        const cacheKey = cacheKeys.parsedBlocks(url);
        const cached = await getCached(cacheKey);
        if (cached) return NextResponse.json(cached);

        const response = await fetch(url, { headers: { "User-Agent": "SEO-Bot/1.0" } });
        if (!response.ok) return NextResponse.json({ error: "Fetch failed" }, { status: 400 });

        const html = await response.text();
        const parsedData = parsePage(html, url);

        await setCached(cacheKey, parsedData, CACHE_TTL.PARSED_BLOCKS);

        return NextResponse.json(parsedData);

    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
    }
}
