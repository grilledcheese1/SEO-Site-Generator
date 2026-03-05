import * as cheerio from "cheerio";
import type { IngestedPage, PageKind } from "../validation/schemas";
import { cleanText } from "./cleaner";
import {
  extractNavigation,
  extractSections,
  pickMainContainer,
  NOISE_SELECTORS
} from "./extractors";

export function inferKindFromPath(pathname: string): PageKind {
  const normalized = pathname.toLowerCase();
  if (normalized === "/") return "home";
  if (normalized.includes("about")) return "about";
  if (normalized.includes("blog")) return "blog";
  if (normalized.includes("review")) return "reviews";
  if (normalized.includes("contact")) return "contact";
  return "page";
}

function truncateDescription(value: string, maxLength = 160): string {
  const text = cleanText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

function deriveTitleFromPath(pathname: string): string {
  if (pathname === "/") return "Home";
  return pathname
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/[-_]+/g, " "))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function extractContactSignals(text: string) {
  const phones = Array.from(new Set((text.match(/\.?1?[\s.-]?\.?\.{3}\.?[\s.-]?\.{3}[\s.-]?\.{4}/g) ?? []).map(cleanText)));
  const emails = Array.from(new Set((text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []).map(cleanText)));
  const addressRegex = /\.\.{1,6}\s+[A-Za-z0-9.'#\.\s]+\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl|Suite|Ste)\.[^\n,]*,?\s*[A-Za-z\s]+,?\s*[A-Z]{2}\s*\.{5}(?:-\.{4})?\./gi;
  const addresses = Array.from(new Set((text.match(addressRegex) ?? []).map(cleanText)));
  return { phones, emails, addresses };
}

function extractMeta($: cheerio.CheerioAPI, name: string): string {
  return cleanText($(`meta[name='${name}']`).attr("content") ?? "");
}

function extractPropertyMeta($: cheerio.CheerioAPI, property: string): string {
  return cleanText($(`meta[property='${property}']`).attr("content") ?? "");
}

export function parsePage(html: string, url: string): IngestedPage {
  const resolvedUrl = new URL(url);
  const path = resolvedUrl.pathname === "/" ? "/" : resolvedUrl.pathname.replace(/\/+$/g, "");
  const $ = cheerio.load(html);

  const headTitle = cleanText($("title").first().text());
  const metaDescription = extractMeta($, "description");
  const canonical = cleanText($("link[rel='canonical']").attr("href") ?? "") || undefined;

  const og = {
    title: extractPropertyMeta($, "og:title") || undefined,
    description: extractPropertyMeta($, "og:description") || undefined,
    url: extractPropertyMeta($, "og:url") || undefined,
    image: extractPropertyMeta($, "og:image") || undefined,
  };

  const twitter = {
    card: extractMeta($, "twitter:card") || undefined,
    title: extractMeta($, "twitter:title") || undefined,
    description: extractMeta($, "twitter:description") || undefined,
    image: extractMeta($, "twitter:image") || undefined,
  };

  const navigation = extractNavigation($);
  const container = pickMainContainer($).clone();
  container.find(NOISE_SELECTORS).remove();

  const sections = extractSections($, container);

  const h1 = sections.find((s) => s.headingLevel === "h1")?.heading ?? cleanText(container.find("h1").first().text());
  const h2 = sections.filter((s) => s.headingLevel === "h2" && s.heading).map((s) => s.heading as string);
  const h3 = sections.filter((s) => s.headingLevel === "h3" && s.heading).map((s) => s.heading as string);
  const paragraphs = sections.filter((s) => s.body).map((s) => s.body as string);
  const bullets = sections.flatMap((s) => s.items ?? []);

  const title = h1 || headTitle || deriveTitleFromPath(path);
  const description = metaDescription || truncateDescription(paragraphs.find((p) => p.length > 40) ?? "");
  const signals = extractContactSignals(cleanText(container.text()));

  const isSPAWarning = sections.length < 2 && paragraphs.length < 2;

  return {
    path,
    url: resolvedUrl.toString(),
    title,
    description,
    canonical,
    kind: inferKindFromPath(path),
    og,
    twitter,
    content: {
      sections,
      h1,
      h2,
      h3,
      paragraphs,
      bullets,
      contactSignals: signals,
    },
    navigation,
    isSPAWarning,
    extractedAt: new Date().toISOString(),
  };
}
