import type { MetadataRoute } from "next";

import { getSiteContent } from "@/lib/content/read";
import { toAbsoluteUrl } from "@/lib/seo/canonical";

function toDisallowPaths(denyPatterns: string[]): string[] {
  const mapped = denyPatterns
    .map((pattern) => pattern.replace(/^\^/, "").replace(/\$$/, ""))
    .map((pattern) => (pattern.startsWith("/") ? pattern : `/${pattern}`));

  return Array.from(new Set(mapped));
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteContent();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? site.baseUrl ?? "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api", "/_next", ...toDisallowPaths(site.filters.denyPatterns)],
    },
    sitemap: toAbsoluteUrl(baseUrl, "/sitemap.xml"),
  };
}

