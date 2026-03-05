import * as cheerio from "cheerio";
import type { AnyNode, Element, Text as TextNode } from "domhandler";
import { type SectionBlock, pageKindSchema } from "../validation/schemas";
import type { SiteNavItem } from "../validation/schemas";
import { cleanHtml, cleanText } from "./cleaner";

export const NOISE_SELECTORS = ["nav", "header", "footer", "script", "style", "noscript", "iframe", "form", "aside"].join(",");
export const MAIN_CONTAINER_SELECTORS = ["main", "#content", ".content", "article"];
export const INLINE_TAGS = new Set(["span", "a", "em", "strong", "b", "i", "u", "small", "abbr", "cite", "code", "mark", "time", "br", "img", "svg"]);
export const GROUP_TAGS = new Set(["div", "section", "article", "main", "figure", "details", "summary"]);
export const HEADING_TAGS: Record<string, "h1" | "h2" | "h3"> = { h1: "h1", h2: "h2", h3: "h3" };
export const CTA_PATTERNS = [/free\s+consult/i, /contact\s+us/i, /call\s+(us|now|today)/i, /get\s+start/i, /schedule/i, /book\s+a/i, /request\s+a/i, /sign\s+up/i, /learn\s+more/i, /get\s+help/i];

export type PendingBlock = {
  headingLevel: "h1" | "h2" | "h3" | null;
  heading: string;
  bodyParts: string[];
  items: string[];
  hasList: boolean;
  hasCta: boolean;
  isFirst: boolean;
};

export function makePendingBlock(isFirst: boolean): PendingBlock {
  return { headingLevel: null, heading: "", bodyParts: [], items: [], hasList: false, hasCta: false, isFirst };
}

export function classifyBlock(block: PendingBlock): SectionBlock["type"] {
  if (block.hasCta) return "cta";
  if (block.hasList) return "list";
  if (block.isFirst && block.headingLevel === "h1") return "hero";
  return "text";
}

export function flushBlock(block: PendingBlock, counter: { n: number }): SectionBlock | null {
  const heading = cleanText(block.heading);
  const body = cleanText(block.bodyParts.join(" "));
  const items = block.items.map(cleanText).filter(Boolean);
  if (!heading && !body && items.length === 0) return null;
  counter.n += 1;
  return {
    id: `block-${counter.n}`,
    type: classifyBlock(block),
    ...((block.headingLevel && heading) ? { headingLevel: block.headingLevel } : {}),
    ...(heading ? { heading } : {}),
    ...(body ? { body } : {}),
    ...(items.length > 0 ? { items } : {}),
  };
}

export function walkNode($: cheerio.CheerioAPI, node: AnyNode, current: PendingBlock, blocks: Array<SectionBlock | null>, counter: { n: number }, depth: number): void {
  if (node.type === "text") {
    const text = cleanText((node as TextNode).data ?? "");
    if (text) current.bodyParts.push(text);
    return;
  }
  if (node.type !== "tag") return;
  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  if (["script", "style", "noscript", "iframe", "form", "aside"].includes(tag)) return;

  if (tag in HEADING_TAGS) {
    const headingText = cleanText($(el).text());
    if (!headingText) return;
    blocks.push(flushBlock(current, counter));
    Object.assign(current, makePendingBlock(false));
    current.headingLevel = HEADING_TAGS[tag];
    current.heading = headingText;
    return;
  }

  if (tag === "ul" || tag === "ol") {
    current.hasList = true;
    $(el).find("li").each((_, li) => {
      const html = cleanHtml($(li).html() ?? "");
      if (html) current.items.push(html);
    });
    return;
  }

  if (tag === "li") {
    const html = cleanHtml($(el).html() ?? "");
    if (html) current.items.push(html);
    return;
  }

  if (tag === "p") {
    const html = cleanHtml($(el).html() ?? "");
    if (html) current.bodyParts.push(html);
    return;
  }

  if (tag === "button" || tag === "a") {
    const text = cleanText($(el).text());
    if (text && CTA_PATTERNS.some((re) => re.test(text))) current.hasCta = true;
    const html = cleanHtml($.html(el) ?? "");
    if (html) current.bodyParts.push(html);
    return;
  }

  if (INLINE_TAGS.has(tag)) {
    const html = cleanHtml($.html(el) ?? "");
    if (html) current.bodyParts.push(html);
    return;
  }

  if (GROUP_TAGS.has(tag) && depth < 8) {
    el.children.forEach((child: AnyNode) => walkNode($, child, current, blocks, counter, depth + 1));
    return;
  }

  const html = cleanHtml($.html(el) ?? "");
  if (html) current.bodyParts.push(html);
}

export function extractSections($: cheerio.CheerioAPI, container: cheerio.Cheerio<AnyNode>): SectionBlock[] {
  const blocks: Array<SectionBlock | null> = [];
  const counter = { n: 0 };
  const current = makePendingBlock(true);

  (container.get(0) as Element | undefined)?.children.forEach((child: AnyNode) => {
    walkNode($, child, current, blocks, counter, 0);
  });
  blocks.push(flushBlock(current, counter));
  return blocks.filter((b): b is SectionBlock => b !== null);
}

export function extractNavigation($: cheerio.CheerioAPI): SiteNavItem[] {
  const navigation: SiteNavItem[] = [];
  $("nav, footer").find("a").each((_, el) => {
    const href = $(el).attr("href");
    const label = cleanText($(el).text());
    if (href && label && !navigation.some((n) => n.path === href)) {
      navigation.push({ label, path: href });
    }
  });
  return navigation;
}

export function pickMainContainer($: cheerio.CheerioAPI): cheerio.Cheerio<AnyNode> {
  for (const selector of MAIN_CONTAINER_SELECTORS) {
    const candidate = $(selector).first();
    if (candidate.length > 0) return candidate;
  }
  return $("body").first();
}
