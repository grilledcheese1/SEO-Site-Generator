import type { BaseSEO } from "./extractor";

export type OptimizedSEO = BaseSEO;

/**
 * Enforces strict length limits matching Google Lighthouse specs ensuring SEO scores
 * stay at 100 on the generated sites.
 */
export function optimizeSEO(rawSeo: BaseSEO): OptimizedSEO {
    // Title constraints (50-60 characters ideal, strict 60 limit here)
    let title = rawSeo.title.trim();
    if (title.length > 60) {
        title = title.substring(0, 57).trim() + "...";
    }

    // Description constraints (150-160 max)
    let desc = rawSeo.description.trim();
    if (desc.length > 155) {
        desc = desc.substring(0, 152).trim() + "...";
    }

    return {
        title,
        description: desc,
        url: rawSeo.url,
        canonical: rawSeo.canonical
    };
}
