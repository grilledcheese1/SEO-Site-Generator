import type { SectionBlock } from "../validation/schemas";

/**
 * Replace semantic template slots in the formal pattern {{block_type.field}}
 * Ex: {{hero.heading}}, {{cta.body}}
 */
export function fillSlot(htmlTemplate: string, blocks: SectionBlock[]): string {
    return htmlTemplate.replace(/\{\{([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\}\}/g, (match, blockType, field) => {
        // 1. Find the matching block class
        const block = blocks.find((b) => b.type === blockType);
        if (!block) return ""; // Fallback mapping behavior for missing types

        // 2. Map standard fields
        if (field === "heading" && block.heading) return block.heading;
        if (field === "body" && block.body) return block.body;

        // 3. Fallback specifically for lists if requested
        if (field === "items" && block.items && block.items.length > 0) {
            return block.items.map(i => `<li>${i}</li>`).join("\n");
    }

    return "";
  });
}
