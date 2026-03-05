import type { SectionBlock } from "../../validation/schemas";

export function buildThemePrompt(classifiedBlocks: SectionBlock[]): string {
  const jsonContext = JSON.stringify(classifiedBlocks, null, 2);

  return `
You are an expert web developer and UI designer. 
Generate a fully complete, ready-to-use HTML template based on the provided classified content blocks and the user's requested style preferences.

JSON Data provided:
\`\`\`json
${jsonContext}
\`\`\`

INSTRUCTIONS:
1. Embed the real content directly from the JSON into a modern HTML structure. Do not use placeholder slots.
2. If navigating links were provided, preserve them. Ensure semantic tags (<a>, <strong>) present in 'body' are respected.
3. Design aesthetic using Tailwind CSS (via a CDN link in <head>) or inline CSS.
4. Output your response as a valid JSON object matching this exact structure:
   {
     "head": "<meta tags, title, stylesheets, scripts>",
     "body": "<the complete inner HTML for the body tag>"
   }
5. Do NOT include markdown blocks (\`\`\`json) or conversational text. Raw JSON string only.
6. The HTML must be semantic and highly optimized (H1, alt tags implied). Implement 'seoGoals'.

Your response MUST be strictly valid JSON.
  `.trim();
}
