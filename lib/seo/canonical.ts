function normalizePath(pathname: string): string {
  const collapsed = pathname.replace(/\/+/g, "/");
  if (collapsed === "/") {
    return "/";
  }

  const trimmed = collapsed.replace(/\/+$/g, "");
  return trimmed.length === 0 ? "/" : trimmed;
}

export function normalizeCanonical(url: string): string {
  const parsed = new URL(url);
  parsed.hash = "";
  parsed.search = "";
  parsed.pathname = normalizePath(parsed.pathname);

  return parsed.toString();
}

export function toAbsoluteUrl(baseUrl: string, path: string): string {
  try {
    const maybeAbsolute = new URL(path);
    return normalizeCanonical(maybeAbsolute.toString());
  } catch {
    // Treat as relative path.
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizeCanonical(new URL(normalizedPath, baseUrl).toString());
}

