import * as cheerio from "cheerio";
import type { AnyNode, Element, Text as TextNode } from "domhandler";

import type {
  IngestedPage,
  PageKind,
  SectionBlock,
  SectionBlockType,
  SiteNavItem,
} from "../../lib/content/types";

import sanitizeHtml from "sanitize-html";

export type ParsedPage = IngestedPage;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

/** Elements removed from the main container before content extraction. */
const NOISE_SELECTORS = [
  "nav",
  "header",
  "footer",
  "script",
  "style",
  "noscript",
  "iframe",
  "form",
  "aside",
].join(",");

/** Priority-ordered selectors for the main content container. */
const MAIN_CONTAINER_SELECTORS = ["main", "#content", ".content", "article"];

/** Inline/void elements whose text should be merged into a parent block. */
const INLINE_TAGS = new Set([
  "span",
  "a",
  "em",
  "strong",
  "b",
  "i",
  "u",
  "small",
  "abbr",
  "cite",
  "code",
  "mark",
  "time",
  "br",
  "img",
  "svg",
]);

/** Block-level grouping tags — recurse into their children. */
const GROUP_TAGS = new Set([
  "div",
  "section",
  "article",
  "main",
  "figure",
  "details",
  "summary",
]);

/** Heading tags that open a new section block. */
const HEADING_TAGS: Record<string, "h1" | "h2" | "h3"> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
};

/** Anchor/button text patterns that indicate a call-to-action. */
const CTA_PATTERNS = [
  /free\s+consult/i,
  /contact\s+us/i,
  /call\s+(us|now|today)/i,
  /get\s+start/i,
  /schedule/i,
  /book\s+a/i,
  /request\s+a/i,
  /sign\s+up/i,
  /learn\s+more/i,
  /get\s+help/i,
];

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

function cleanText(value: string): string {
  return value.replaceAll("\u00A0", " ").replace(/\s+/g, " ").trim();
}

function cleanHtml(value: string): string {
  if (!value) return "";
  const sanitized = sanitizeHtml(value, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'span'],
    allowedAttributes: {
      'a': ['href', 'title']
    }
  });
  return sanitized.replaceAll("\u00A0", " ").replace(/\s+/g, " ").trim();
}

function extractMeta($: cheerio.CheerioAPI, name: string): string {
  return cleanText($(`meta[name='${name}']`).attr("content") ?? "");
}

function extractPropertyMeta($: cheerio.CheerioAPI, property: string): string {
  return cleanText($(`meta[property='${property}']`).attr("content") ?? "");
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

function truncateDescription(value: string, maxLength = 160): string {
  const text = cleanText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
}

function extractContactSignals(text: string): {
  phones: string[];
  emails: string[];
  addresses: string[];
} {
  const phones = Array.from(
    new Set(
      (text.match(/\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g) ?? []).map(
        cleanText,
      ),
    ),
  );
  const emails = Array.from(
    new Set(
      (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []).map(cleanText),
    ),
  );
  const addressRegex =
    /\b\d{1,6}\s+[A-Za-z0-9.'#\-\s]+\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl|Suite|Ste)\b[^\n,]*,?\s*[A-Za-z\s]+,?\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?\b/gi;
  const addresses = Array.from(
    new Set((text.match(addressRegex) ?? []).map(cleanText)),
  );
  return { phones, emails, addresses };
}

// ---------------------------------------------------------------------------
// Container selection
// ---------------------------------------------------------------------------

function pickMainContainer($: cheerio.CheerioAPI): cheerio.Cheerio<AnyNode> {
  for (const selector of MAIN_CONTAINER_SELECTORS) {
    const candidate = $(selector).first();
    if (candidate.length > 0) return candidate;
  }
  return $("body").first();
}

// ---------------------------------------------------------------------------
// DOM-order section extraction
// ---------------------------------------------------------------------------

/**
 * Represents a mutable section block being built while walking the DOM.
 * When flushed it becomes a `SectionBlock`.
 */
type PendingBlock = {
  headingLevel: "h1" | "h2" | "h3" | null;
  heading: string;
  bodyParts: string[];
  items: string[];
  hasList: boolean;
  hasCta: boolean;
  isFirst: boolean;
};

function makePendingBlock(isFirst: boolean): PendingBlock {
  return {
    headingLevel: null,
    heading: "",
    bodyParts: [],
    items: [],
    hasList: false,
    hasCta: false,
    isFirst,
  };
}

function classifyBlock(block: PendingBlock): SectionBlockType {
  if (block.hasCta) return "cta";
  if (block.hasList) return "list";
  if (block.isFirst && block.headingLevel === "h1") return "hero";
  return "text";
}

function flushBlock(
  block: PendingBlock,
  counter: { n: number },
): SectionBlock | null {
  const heading = cleanText(block.heading);
  const body = cleanText(block.bodyParts.join(" "));
  const items = block.items.map(cleanText).filter(Boolean);

  // Skip empty blocks (no heading, no body, no items)
  if (!heading && !body && items.length === 0) return null;

  counter.n += 1;
  return {
    id: `block-${counter.n}`,
    type: classifyBlock(block),
    ...(block.headingLevel ? { headingLevel: block.headingLevel } : {}),
    ...(heading ? { heading } : {}),
    ...(body ? { body } : {}),
    ...(items.length > 0 ? { items } : {}),
  };
}

/**
 * Recursively walks a cheerio element tree in document order.
 * Accumulates content into `current` block; opens a new block on each heading.
 */
function walkNode(
  $: cheerio.CheerioAPI,
  node: AnyNode,
  current: PendingBlock,
  blocks: Array<SectionBlock | null>,
  counter: { n: number },
  depth: number,
): void {
  if (node.type === "text") {
    const text = cleanText((node as TextNode).data ?? "");
    if (text) current.bodyParts.push(text);
    return;
  }

  if (node.type !== "tag") return;

  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  // Skip noise at any depth
  if (["script", "style", "noscript", "iframe", "form", "aside"].includes(tag)) {
    return;
  }

  // -------------------------------------------------------------------------
  // Heading tags → close current block, open a new one
  // -------------------------------------------------------------------------
  if (tag in HEADING_TAGS) {
    const headingLevel = HEADING_TAGS[tag];
    const headingText = cleanText($(el).text());
    if (!headingText) return;

    // Flush the current pending block (may return null if empty)
    blocks.push(flushBlock(current, counter));

    // Reset current to a fresh block
    Object.assign(current, makePendingBlock(false));
    current.headingLevel = headingLevel;
    current.heading = headingText;
    return;
  }

  // -------------------------------------------------------------------------
  // List tags → collect items, mark as list block
  // -------------------------------------------------------------------------
  if (tag === "ul" || tag === "ol") {
    current.hasList = true;
    $(el)
      .find("li")
      .each((_, li) => {
        const html = cleanHtml($(li).html() ?? "");
        if (html) current.items.push(html);
      });
    return;
  }

  // A single list item outside ul/ol (rare but possible)
  if (tag === "li") {
    const html = cleanHtml($(el).html() ?? "");
    if (html) current.items.push(html);
    return;
  }

  // -------------------------------------------------------------------------
  // Paragraph tag → add to body
  // -------------------------------------------------------------------------
  if (tag === "p") {
    const html = cleanHtml($(el).html() ?? "");
    if (html) current.bodyParts.push(html);
    return;
  }

  // -------------------------------------------------------------------------
  // Button / anchor → check for CTA signal, then add text to body
  // -------------------------------------------------------------------------
  if (tag === "button" || tag === "a") {
    const text = cleanText($(el).text());
    if (text && CTA_PATTERNS.some((re) => re.test(text))) {
      current.hasCta = true;
    }
    const html = cleanHtml($.html(el) ?? "");
    if (html) current.bodyParts.push(html);
    return;
  }

  // -------------------------------------------------------------------------
  // Inline elements → merge text into current body
  // -------------------------------------------------------------------------
  if (INLINE_TAGS.has(tag)) {
    const html = cleanHtml($.html(el) ?? "");
    if (html) current.bodyParts.push(html);
    return;
  }

  // -------------------------------------------------------------------------
  // Group/block elements — recurse into children in document order
  // (but don't recurse too deep to avoid noise from deeply nested layouts)
  // -------------------------------------------------------------------------
  if (GROUP_TAGS.has(tag) && depth < 8) {
    el.children.forEach((child: AnyNode) => {
      walkNode($, child, current, blocks, counter, depth + 1);
    });
    return;
  }

  // -------------------------------------------------------------------------
  // Anything else — extract text and add to body
  // -------------------------------------------------------------------------
  const text = cleanText($(el).text());
  if (text) current.bodyParts.push(text);
}

/**
 * Entry point: walks the container in document order and returns ordered
 * `SectionBlock[]`. Each heading opens a new block; content between headings
 * belongs to the preceding heading's block.
 *
 * Important: no `dedupe()` is applied to block content. Every element is
 * processed. Deduplication would silently discard content.
 */
function extractSections(
  $: cheerio.CheerioAPI,
  container: cheerio.Cheerio<AnyNode>,
): SectionBlock[] {
  const blocks: Array<SectionBlock | null> = [];
  const counter = { n: 0 };

  // The very first pending block starts as a "hero" candidate
  const current: PendingBlock = makePendingBlock(true);

  (container.get(0) as Element | undefined)?.children.forEach((child: AnyNode) => {
    walkNode($, child, current, blocks, counter, 0);
  });


  // Flush the final pending block
  blocks.push(flushBlock(current, counter));

  return blocks.filter((b): b is SectionBlock => b !== null);
}

// ---------------------------------------------------------------------------
// Page kind
// ---------------------------------------------------------------------------

export function inferKindFromPath(pathname: string): PageKind {
  const normalized = pathname.toLowerCase();
  if (normalized === "/") return "home";
  if (normalized.includes("about")) return "about";
  if (normalized.includes("blog")) return "blog";
  if (normalized.includes("review")) return "reviews";
  if (normalized.includes("contact")) return "contact";
  return "page";
}

// ---------------------------------------------------------------------------
// Main parse function
// ---------------------------------------------------------------------------

export function parsePage(html: string, url: string): ParsedPage {
  const resolvedUrl = new URL(url);
  const path =
    resolvedUrl.pathname === "/"
      ? "/"
      : resolvedUrl.pathname.replace(/\/+$/g, "");

  const $ = cheerio.load(html);

  // --- Meta ---
  const headTitle = cleanText($("title").first().text());
  const metaDescription = extractMeta($, "description");
  const canonical =
    cleanText($("link[rel='canonical']").attr("href") ?? "") || undefined;

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

  // --- Navigation Extraction ---
  const navigation: SiteNavItem[] = [];
  $("nav, footer").find("a").each((_, el) => {
    const href = $(el).attr("href");
    const label = cleanText($(el).text());
    if (href && label && !navigation.some((n) => n.path === href)) {
      navigation.push({ label, path: href });
    }
  });

  // --- Container ---
  const container = pickMainContainer($).clone();
  container.find(NOISE_SELECTORS).remove();

  // --- Ordered section extraction (primary) ---
  const sections = extractSections($, container);

  // --- Legacy flat fields derived from sections (backward compat) ---
  // We derive these FROM sections so they stay in sync, without dedupe.
  const h1 =
    sections.find((s) => s.headingLevel === "h1")?.heading ??
    cleanText(container.find("h1").first().text());

  const h2 = sections
    .filter((s) => s.headingLevel === "h2" && s.heading)
    .map((s) => s.heading as string);

  const h3 = sections
    .filter((s) => s.headingLevel === "h3" && s.heading)
    .map((s) => s.heading as string);

  const paragraphs = sections
    .filter((s) => s.body)
    .map((s) => s.body as string);

  const bullets = sections.flatMap((s) => s.items ?? []);

  // --- Title / description resolution ---
  const title = h1 || headTitle || deriveTitleFromPath(path);
  const description =
    metaDescription ||
    truncateDescription(paragraphs.find((p) => p.length > 40) ?? "");

  // --- Contact signals (whole-page text, not container-scoped) ---
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
