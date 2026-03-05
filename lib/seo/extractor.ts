import type { IngestedPage } from "../validation/schemas";

export type BaseSEO = {
    title: string;
    description: string;
    url: string;
    canonical?: string;
}

/**
 * Extracts normalized raw SEO variables directly from the Cheerio ingested page 
 * prior to targeted LLM optimization.
 */
export function extractSEO(page: IngestedPage): BaseSEO {
    return {
        title: page?.title || "",
        description: page?.description || "",
        url: page?.url || "",
        canonical: page?.canonical || page?.url
    };
}
