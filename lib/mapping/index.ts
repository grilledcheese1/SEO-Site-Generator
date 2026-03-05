import { enforceConfidence } from "./confidence";
import { fillSlot } from "./slot-filler";
import type { SectionBlock } from "../validation/schemas";

export function orchestrateMapping(templateHtml: string, blocks: SectionBlock[]): string {
    // Ensure critical layout elements exist
    const coercedBlocks = enforceConfidence(blocks, ["hero", "cta", "features"]);

    // Rip them into the slots
    return fillSlot(templateHtml, coercedBlocks);
}
