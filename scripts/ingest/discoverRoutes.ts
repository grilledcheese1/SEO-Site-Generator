import * as cheerio from "cheerio";

const EXCLUDED_PROTOCOLS = new Set(["mailto:", "tel:", "javascript:", "data:"]);
const EXCLUDED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".ico",
  ".bmp",
  ".tif",
  ".tiff",
  ".pdf",
  ".zip",
  ".rar",
  ".7z",
  ".tar",
  ".gz",
  ".mp3",
  ".wav",
  ".mp4",
  ".mov",
  ".avi",
  ".wmv",
  ".css",
  ".js",
  ".mjs",
  ".cjs",
  ".xml",
  ".txt",
  ".json",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
]);

export type DiscoverRoutesOptions = {
  keepQuery?: boolean;
  timeoutMs?: number;
  userAgent?: string;
  maxRoutes?: number;
  allowPatterns?: string[];
  denyPatterns?: string[];
};

function hasExcludedProtocol(href: string): boolean {
  const lower = href.trim().toLowerCase();
  return Array.from(EXCLUDED_PROTOCOLS).some((protocol) => lower.startsWith(protocol));
}

function hasExcludedExtension(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return Array.from(EXCLUDED_EXTENSIONS).some((ext) => lower.endsWith(ext));
}

function normalizeRoute(url: URL, keepQuery: boolean): string {
  const pathname = url.pathname.replace(/\/{2,}/g, "/");
  const normalizedPath =
    pathname === "/" ? "/" : pathname.replace(/\/+$/g, "") || "/";
  const route = normalizedPath === "//" ? "/" : normalizedPath;
  return keepQuery && url.search ? `${route}${url.search}` : route;
}

function toSameOriginRoute(
  href: string,
  baseUrl: URL,
  keepQuery: boolean
): string | null {
  const raw = href.trim();
  if (!raw || hasExcludedProtocol(raw) || raw.startsWith("#")) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw, baseUrl);
  } catch {
    return null;
  }

  if (parsed.origin !== baseUrl.origin) {
    return null;
  }

  if (hasExcludedExtension(parsed.pathname)) {
    return null;
  }

  parsed.hash = "";
  if (!keepQuery) {
    parsed.search = "";
  }

  return normalizeRoute(parsed, keepQuery);
}

export async function discoverRoutes(
  baseUrl: string,
  options: DiscoverRoutesOptions = {}
): Promise<string[]> {
  const keepQuery = options.keepQuery ?? false;
  const timeoutMs = options.timeoutMs ?? 10_000;
  const userAgent =
    options.userAgent ?? "mchazlettlawfirm-discover-routes/1.0 (+https://mchazlettlawfirm.com)";
  const maxRoutes = Math.max(1, options.maxRoutes ?? 200);
  const allowRegex = (options.allowPatterns ?? [])
    .map((pattern) => {
      try {
        return new RegExp(pattern, "i");
      } catch {
        return null;
      }
    })
    .filter((pattern): pattern is RegExp => pattern !== null);
  const denyRegex = (options.denyPatterns ?? [])
    .map((pattern) => {
      try {
        return new RegExp(pattern, "i");
      } catch {
        return null;
      }
    })
    .filter((pattern): pattern is RegExp => pattern !== null);

  const base = new URL(baseUrl);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(base.toString(), {
      headers: {
        "user-agent": userAgent,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${base.toString()} (${response.status})`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new Error(`Expected HTML from ${base.toString()} but got ${contentType || "unknown"}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const routes = new Set<string>([normalizeRoute(base, keepQuery)]);

    $("a[href]").each((_, element) => {
      const href = $(element).attr("href");
      if (!href) {
        return;
      }

      const route = toSameOriginRoute(href, base, keepQuery);
      if (route) {
        if (denyRegex.some((pattern) => pattern.test(route))) {
          return;
        }
        if (allowRegex.length > 0 && !allowRegex.some((pattern) => pattern.test(route))) {
          return;
        }
        routes.add(route);
      }
    });

    return Array.from(routes).sort((a, b) => a.localeCompare(b)).slice(0, maxRoutes);
  } finally {
    clearTimeout(timeoutId);
  }
}

