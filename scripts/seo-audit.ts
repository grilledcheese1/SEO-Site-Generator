import fs from "node:fs/promises";
import path from "node:path";

import { siteContentSchema } from "../lib/content/schema.ts";
import { normalizeCanonical } from "../lib/seo/canonical.ts";

const SITE_CONTENT_PATH = path.join(process.cwd(), "content", "site.json");

function wordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

async function getSiteContent() {
  const raw = await fs.readFile(SITE_CONTENT_PATH, "utf8");
  return siteContentSchema.parse(JSON.parse(raw) as unknown);
}

async function main() {
  const site = await getSiteContent();
  const titleMap = new Map<string, string[]>();

  for (const page of site.pages) {
    const warnings: string[] = [];

    if (!page.title.trim()) {
      warnings.push("missing title");
    }

    if (!page.description.trim()) {
      warnings.push("missing description");
    } else if (page.description.length > 160) {
      warnings.push("description too long (>160 chars)");
    }

    if (page.canonical) {
      const normalized = normalizeCanonical(page.canonical);
      if (normalized !== page.canonical) {
        warnings.push(`canonical mismatch expected ${normalized}`);
      }
    }

    const contentText = [
      page.content.h1,
      ...page.content.h2,
      ...page.content.h3,
      ...page.content.paragraphs,
      ...page.content.bullets,
    ].join(" ");

    if (wordCount(contentText) < 150) {
      warnings.push("very thin page content (<150 words)");
    }

    if (warnings.length > 0) {
      console.log(`WARN ${page.path}: ${warnings.join("; ")}`);
    }

    const key = page.title.trim().toLowerCase();
    if (key) {
      const paths = titleMap.get(key) ?? [];
      paths.push(page.path);
      titleMap.set(key, paths);
    }
  }

  for (const [title, paths] of titleMap.entries()) {
    if (paths.length > 1) {
      console.log(`WARN duplicate title \"${title}\" used on: ${paths.join(", ")}`);
    }
  }

  console.log(`SEO audit complete. Checked ${site.pages.length} pages.`);
}

void main();
