const DEFAULT_USER_AGENT =
  "mchazlettlawfirm-ingest/1.0 (+https://mchazlettlawfirm.com)";

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_DELAY_MS = 400;

let lastRequestAt = 0;

export type FetchHtmlResult = {
  url: string;
  status: number;
  html: string;
};

export type FetchHtmlOptions = {
  userAgent?: string;
  timeoutMs?: number;
  maxRetries?: number;
  delayMs?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForRateLimit(delayMs: number): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestAt;
  const waitMs = Math.max(0, delayMs - elapsed);

  if (waitMs > 0) {
    await sleep(waitMs);
  }
}

function isTransientStatus(status: number): boolean {
  return [408, 425, 429, 500, 502, 503, 504].includes(status);
}

function isTransientError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.name === "AbortError") {
    return true;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("econnreset") ||
    message.includes("enotfound")
  );
}

export async function fetchHtml(
  targetUrl: string,
  options: FetchHtmlOptions = {}
): Promise<FetchHtmlResult> {
  const maxRetries = Math.max(1, options.maxRetries ?? DEFAULT_MAX_RETRIES);
  const timeoutMs = Math.max(1_000, options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const delayMs = Math.max(0, options.delayMs ?? DEFAULT_DELAY_MS);
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    await waitForRateLimit(delayMs);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(targetUrl, {
        redirect: "follow",
        headers: {
          "user-agent": userAgent,
        },
        signal: controller.signal,
      });

      lastRequestAt = Date.now();

      const finalUrl = response.url || targetUrl;
      const status = response.status;

      if (!response.ok && isTransientStatus(status) && attempt < maxRetries) {
        console.warn(
          `fetchHtml transient status ${status} for ${targetUrl}; retry ${attempt}/${maxRetries}`
        );
        await sleep(250 * attempt);
        continue;
      }

      if (!response.ok) {
        console.error(`fetchHtml failed with status ${status} for ${targetUrl}`);
        return { url: finalUrl, status, html: "" };
      }

      const html = await response.text();
      return { url: finalUrl, status, html };
    } catch (error) {
      lastRequestAt = Date.now();
      lastError = error;

      if (attempt < maxRetries && isTransientError(error)) {
        const message = error instanceof Error ? error.message : "unknown error";
        console.warn(
          `fetchHtml transient error for ${targetUrl}: ${message}; retry ${attempt}/${maxRetries}`
        );
        await sleep(250 * attempt);
        continue;
      }

      const message = error instanceof Error ? error.message : "unknown error";
      console.error(`fetchHtml failed for ${targetUrl}: ${message}`);
      break;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  const message = lastError instanceof Error ? lastError.message : "unknown error";
  console.error(`fetchHtml exhausted retries for ${targetUrl}: ${message}`);
  return { url: targetUrl, status: 0, html: "" };
}

