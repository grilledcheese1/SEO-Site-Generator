import type { OptimizedSEO } from "./optimizer";

/**
 * Patches the <head> string provided by the LLM (or base template) to forcibly include
 * optimized title tags, canonicals, and meta descriptions so they cannot be skipped.
 */
export function injectSEO(htmlHead: string, metadata: OptimizedSEO): string {
    let head = htmlHead;

    // Forcibly strip and replace <title>
    head = head.replace(/<title>.*?<\/title >/i, "");
    head = `<title>${metadata.title}</title>\n` + head;

  // Replace description if it exists, or inject it
  if (head.includes('name="description"')) {
    head = head.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, 
                        `<meta name="description" content="${metadata.description}">`);
  } else {
    head = `<meta name="description" content="${metadata.description}">\n` + head;
  }

  return head;
}
