import fs from "node:fs/promises";
import path from "node:path";

import { siteContentSchema } from "../lib/content/schema.ts";
import { toAbsoluteUrl } from "../lib/seo/canonical.ts";

const SITE_CONTENT_PATH = path.join(process.cwd(), "content", "site.json");

async function getSiteContent() {
  const raw = await fs.readFile(SITE_CONTENT_PATH, "utf8");
  return siteContentSchema.parse(JSON.parse(raw) as unknown);
}

async function main() {
  const site = await getSiteContent();
  const urls = site.pages.map((page) => toAbsoluteUrl(site.baseUrl, page.canonical ?? page.path));

  console.log(`Pages: ${site.pages.length}`);
  console.log(`Unique URLs: ${new Set(urls).size}`);
  console.log("Top URLs:");

  urls
    .slice(0, 20)
    .forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
    });

  if (new Set(urls).size !== urls.length) {
    console.log("WARN Duplicate canonical URLs detected.");
  }
}

void main();
