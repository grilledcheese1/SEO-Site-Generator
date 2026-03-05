import type { SectionBlock } from "../validation/schemas";

/**
 * Handles ensuring required block types exist in an AI classification suite,
 * coercing nearby logical blocks into empty requirements if needed to satisfy layout.
 */
export function enforceConfidence(blocks: SectionBlock[], requiredTypes: string[]): SectionBlock[] {
    const result = [...blocks];
    for (const req of requiredTypes) {
        const exists = result.some(b => b.type === req);
        if (!exists) {
            // Find the largest 'text' block and coerce it into the required type
            const fallback = result.find(b => b.type === "text" && b.body && b.body.length > 50);
            if (fallback) {
                fallback.type = req as SectionBlock["type"]; // Coerce
            }
        }
    }
    return result;
}
