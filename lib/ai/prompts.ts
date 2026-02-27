import { z } from "zod";
import type { ParsedPage } from "../../scripts/ingest/parsePage";

export const generateThemeRequestSchema = z.object({
    url: z.string().url(),
    themeStyle: z.string(),
    tone: z.string(),
    seoGoals: z.string(),
});

export type GenerateThemeRequest = z.infer<typeof generateThemeRequestSchema>;

export function buildSystemPrompt(parsedData: ParsedPage): string {
    const jsonContext = JSON.stringify(parsedData, null, 2);

    return `
You are an expert web developer and UI/UX designer. Your objective is to generate a fully complete, ready-to-use HTML template based on the provided website data and the user's requested style preferences.

Here is the parsed structural JSON data for the target website:
\`\`\`json
${jsonContext}
\`\`\`

INSTRUCTIONS:
1. Act as a layout engine. Map the content from the JSON naturally into an appropriate, modern HTML structure. Do NOT use fake variables like {{hero.heading}}. Embed the real content directly.
2. Ensure you preserve ALL navigation links provided in the 'navigation' array and any HTML formatting (like <a> or <strong> tags) already present in the block text.
3. Design the aesthetic of the site (colors, spacing, typography) using inline CSS, a <style> block, or Tailwind CSS classes (via CDN) depending on standard best practices for a downloadable template.
4. Output your response as a valid JSON object with the following exact structure:
   {
     "head": "<meta tags, title, stylesheets, scripts>",
     "body": "<the complete inner HTML for the body tag, including <header>, <main>, and <footer>>"
   }
5. Do NOT include markdown blocks (\`\`\`json) or extra conversational text in your final response. Return ONLY the raw JSON string.
6. The HTML must be semantic, SEO-optimized, and score highly on Lighthouse. Implement the exact 'seoGoals' requested by the user.

Your response MUST be strictly valid JSON.
  `.trim();
}
