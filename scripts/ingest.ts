import fs from "node:fs/promises";
import path from "node:path";

import { siteContentSchema } from "../lib/content/schema.ts";
import type { IngestedPage, SiteContent, SiteNavItem } from "../lib/content/types.ts";
import { normalizeCanonical } from "../lib/seo/canonical.ts";
import { discoverRoutes } from "./ingest/discoverRoutes.ts";
import { fetchHtml } from "./ingest/fetchHtml.ts";
import { parsePage } from "./ingest/parsePage.ts";

const OUTPUT_PATH = path.join(process.cwd(), "content", "site.json");

const config = {
  baseUrl: process.env.TARGET_SITE_URL ?? "https://mchazlettlawfirm.com",
  maxRoutes: Number(process.env.INGEST_MAX_ROUTES ?? 200),
  timeoutMs: Number(process.env.INGEST_TIMEOUT_MS ?? 15_000),
  delayMs: Number(process.env.INGEST_DELAY_MS ?? 400),
  allowPatterns: (process.env.INGEST_ALLOW_PATTERNS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  denyPatterns: (process.env.INGEST_DENY_PATTERNS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
};

function matchesPatterns(input: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    try {
      return new RegExp(pattern, "i").test(input);
    } catch {
      return false;
    }
  });
}

function routeIsAllowed(route: string): boolean {
  if (matchesPatterns(route, config.denyPatterns)) {
    return false;
  }

  if (config.allowPatterns.length === 0) {
    return true;
  }

  return matchesPatterns(route, config.allowPatterns);
}

function dedupe<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function deriveNavItems(pages: IngestedPage[]): SiteNavItem[] {
  const byPriority = ["home", "about", "blog", "reviews", "contact"];

  return pages
    .slice()
    .sort((left, right) => {
      const leftIdx = byPriority.indexOf(left.kind);
      const rightIdx = byPriority.indexOf(right.kind);
      const normalizedLeftIdx = leftIdx === -1 ? byPriority.length : leftIdx;
      const normalizedRightIdx = rightIdx === -1 ? byPriority.length : rightIdx;

      if (normalizedLeftIdx !== normalizedRightIdx) {
        return normalizedLeftIdx - normalizedRightIdx;
      }

      return left.path.localeCompare(right.path);
    })
    .slice(0, 8)
    .map((page) => ({
      label: page.title,
      path: page.path,
    }));
}

async function ingest(): Promise<SiteContent> {
  const errors: string[] = [];
  const discoveredRoutes = await discoverRoutes(config.baseUrl, {
    allowPatterns: config.allowPatterns,
    denyPatterns: config.denyPatterns,
    maxRoutes: config.maxRoutes,
    timeoutMs: config.timeoutMs,
  });

  const pagesByPath = new Map<string, IngestedPage>();

  for (const route of discoveredRoutes) {
    if (!routeIsAllowed(route)) {
      continue;
    }

    const url = new URL(route, config.baseUrl).toString();
    const result = await fetchHtml(url, {
      timeoutMs: config.timeoutMs,
      maxRetries: 3,
      delayMs: config.delayMs,
    });

    if (!result.html) {
      errors.push(`Failed to fetch HTML for ${url} (status: ${result.status})`);
      continue;
    }

    try {
      const parsed = parsePage(result.html, result.url);
      parsed.path = parsed.path === "/" ? "/" : parsed.path.replace(/\/+$/g, "");
      parsed.canonical = parsed.canonical
        ? normalizeCanonical(new URL(parsed.canonical, url).toString())
        : undefined;
      pagesByPath.set(parsed.path, parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown parse error";
      errors.push(`Parse failed for ${url}: ${message}`);
    }
  }

  const pages = Array.from(pagesByPath.values()).sort((left, right) => left.path.localeCompare(right.path));
  const home = pages.find((page) => page.path === "/");
  const phones = dedupe(pages.flatMap((page) => page.content.contactSignals.phones));

  const site = {
    baseUrl: normalizeCanonical(config.baseUrl),
    generatedAt: new Date().toISOString(),
    metadata: {
      siteName: home?.title ?? "",
      defaultTitle: home?.title ?? "",
      defaultDescription: home?.description ?? "",
      locale: "en-US",
      organizationName: home?.title ?? undefined,
      phones: phones.length > 0 ? phones : undefined,
    },
    nav: {
      primary: deriveNavItems(pages),
      footer: deriveNavItems(pages),
    },
    filters: {
      allowPatterns: config.allowPatterns,
      denyPatterns: config.denyPatterns,
    },
    pages,
    errors,
  };

  return siteContentSchema.parse(site);
}

async function main() {
  try {
    const site = await ingest();
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(site, null, 2)}\n`, "utf8");
    console.log(`Ingested ${site.pages.length} pages -> ${OUTPUT_PATH}`);
    if (site.errors.length > 0) {
      console.log(`Completed with ${site.errors.length} warnings.`);
    }
  } catch (error) {
    console.error("Ingestion failed with validation/runtime error:", error);
    process.exitCode = 1;
  }
}

void main();

