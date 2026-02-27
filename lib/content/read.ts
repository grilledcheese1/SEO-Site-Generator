import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import { siteContentSchema } from "@/lib/content/schema";
import type { IngestedPage, SiteContent } from "@/lib/content/types";

const SITE_CONTENT_PATH = path.join(process.cwd(), "content", "site.json");

const DEFAULT_SITE_CONTENT: SiteContent = {
  baseUrl: "http://localhost:3000",
  generatedAt: new Date(0).toISOString(),
  metadata: {
    siteName: "",
    defaultTitle: "",
    defaultDescription: "",
    locale: "en-US",
  },
  nav: {
    primary: [],
    footer: [],
  },
  filters: {
    allowPatterns: [],
    denyPatterns: [],
  },
  pages: [],
  errors: [],
};

function normalizePath(inputPath: string): string {
  const prefixed = inputPath.startsWith("/") ? inputPath : `/${inputPath}`;
  const collapsed = prefixed.replace(/\/+/g, "/");
  if (collapsed === "/") {
    return "/";
  }

  const trimmed = collapsed.replace(/\/+$/g, "");
  return trimmed || "/";
}

async function readJson(filePath: string): Promise<unknown> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as unknown;
}

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  try {
    return siteContentSchema.parse(await readJson(SITE_CONTENT_PATH));
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
});

export const getPageByPath = cache(async (inputPath: string): Promise<IngestedPage | null> => {
  const site = await getSiteContent();
  const normalized = normalizePath(inputPath);

  const match = site.pages.find((page) => normalizePath(page.path) === normalized);
  return match ?? null;
});

