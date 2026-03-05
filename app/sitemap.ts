import type { MetadataRoute } from "next";

import { getSiteContent } from "@/lib/content/read";
import { toAbsoluteUrl } from "@/lib/seo/canonical";
import type { IngestedPage } from "@/lib/validation/schemas";

function isDenied(path: string, denyPatterns: string[]): boolean {
  return denyPatterns.some((pattern) => {
    try {
      return new RegExp(pattern, "i").test(path);
    } catch {
      return false;
    }
  });
}

function inferChangeFrequency(kind: string): MetadataRoute.Sitemap[number]["changeFrequency"] {
  return kind === "home" || kind === "blog" ? "weekly" : "monthly";
}

function inferPriority(kind: string): number {
  if (kind === "home") {
    return 1;
  }
  if (kind === "about" || kind === "reviews") {
    return 0.7;
  }

  return 0.6;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteContent();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? site.baseUrl ?? "http://localhost:3000";

  return site.pages
    .filter((page: IngestedPage) => !isDenied(page.path, site.filters.denyPatterns))
    .map((page: IngestedPage) => ({
      url: toAbsoluteUrl(baseUrl, page.canonical ?? page.path),
      lastModified: page.extractedAt || site.generatedAt,
      changeFrequency: inferChangeFrequency(page.kind),
      priority: inferPriority(page.kind),
    }));
}
