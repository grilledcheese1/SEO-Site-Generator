import { injectSEO } from "../seo/injector";
import type { OptimizedSEO } from "../seo/optimizer";

/**
 * Compiles the raw HTML body provided by the LLM or Base Template
 * with the strictly optimized SEO header into a final, valid document.
 */
export function compileHtml(headHtml: string, bodyHtml: string, metadata: OptimizedSEO): string {
    const optimizedHead = injectSEO(headHtml, metadata);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${optimizedHead}
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}
