import type { SectionBlock } from "@/lib/validation/schemas";

type ContentSectionsProps = {
    sections: SectionBlock[];
};

// ---------------------------------------------------------------------------
// Icon cycle for text (feature) cards — index2 lines 207, 217, 227
// ---------------------------------------------------------------------------
const FEATURE_ICONS = ["✓", "⚡", "✦"] as const;
const FEATURE_ICON_STYLES = [
    { bg: "bg-(--theme-brand)/10", text: "text-(--theme-brand)" },
    { bg: "bg-(--theme-accent)/10", text: "text-(--theme-accent)" },
    { bg: "bg-(--theme-muted)/10", text: "text-(--theme-heading)" },
] as const;

// ---------------------------------------------------------------------------
// Group consecutive blocks of the same type — mirrors index2 section grouping
// ---------------------------------------------------------------------------
type BlockGroup = { type: SectionBlock["type"]; blocks: SectionBlock[] };

function groupConsecutive(sections: SectionBlock[]): BlockGroup[] {
    if (sections.length === 0) return [];

    const groups: BlockGroup[] = [];
    let current: BlockGroup = { type: sections[0].type, blocks: [sections[0]] };

    for (let i = 1; i < sections.length; i++) {
        const block = sections[i];
        // hero and cta always render standalone (never merged into a group)
        if (
            block.type === current.type &&
            block.type !== "hero" &&
            block.type !== "cta"
        ) {
            current.blocks.push(block);
        } else {
            groups.push(current);
            current = { type: block.type, blocks: [block] };
        }
    }
    groups.push(current);
    return groups;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export default function ContentSections({ sections }: ContentSectionsProps) {
    if (sections.length === 0) return null;
    const groups = groupConsecutive(sections);

    return (
        <div className="space-y-12">
            {groups.map((group, gi) => {
                switch (group.type) {
                    case "hero":
                        // hero always has exactly one block (standalone)
                        return <HeroGroup key={gi} block={group.blocks[0]} />;
                    case "text":
                        return <TextGroup key={gi} blocks={group.blocks} />;
                    case "list":
                        return <ListGroup key={gi} blocks={group.blocks} />;
                    case "cta":
                        return <CtaGroup key={gi} blocks={group.blocks} />;
                    default:
                        return <TextGroup key={gi} blocks={group.blocks} />;
                }
            })}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Hero group — index2 lines 97–193 (full-width, standalone)
// Only appears when a hero block is in the sections array (not from PageHero)
// ---------------------------------------------------------------------------
function HeroGroup({ block }: { block: SectionBlock }) {
    return (
        <section className="relative overflow-hidden rounded-3xl border border-(--theme-border) bg-(--theme-surface) px-6 py-10 shadow-(--theme-shadow-soft)">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-(--theme-brand)/15 blur-3xl" />
                <div className="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-(--theme-accent)/15 blur-3xl" />
            </div>

            {block.heading && (
                <h1 className="text-4xl font-bold tracking-tight text-(--theme-heading) sm:text-5xl">
                    {block.heading}
                </h1>
            )}
            {block.body && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-(--theme-muted)">
                    {block.body}
                </p>
            )}
            {block.items && block.items.length > 0 && (
                <ul className="mt-6 space-y-2">
                    {block.items.map((item, i) => (
                        <li key={`hero-${i}-${item.slice(0, 20)}`} className="flex items-center gap-2 text-sm text-(--theme-text)">
                            <span className="h-1.5 w-1.5 rounded-full bg-(--theme-accent)" />
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

// ---------------------------------------------------------------------------
// Text/feature group — index2 lines 195–234
// Consecutive text blocks → 3-col feature card grid
// Each card: cycling icon badge + heading + body
// ---------------------------------------------------------------------------
function TextGroup({ blocks }: { blocks: SectionBlock[] }) {
    // Decide on grid columns based on count — mirrors index2's grid-cols-3
    const gridCols =
        blocks.length === 1
            ? ""
            : blocks.length === 2
                ? "md:grid-cols-2"
                : "md:grid-cols-2 lg:grid-cols-3";

    return (
        <section className="space-y-6">
            <div className={`grid gap-4 ${gridCols}`}>
                {blocks.map((block, i) => {
                    const icon = FEATURE_ICONS[i % 3];
                    const style = FEATURE_ICON_STYLES[i % 3];
                    const HeadingTag = block.headingLevel ?? "h3";
                    return (
                        <div
                            key={block.id}
                            className="rounded-3xl border border-(--theme-border) bg-(--theme-surface) p-5 shadow-(--theme-shadow-soft) transition hover:shadow-lg"
                        >
                            {/* Icon badge — index2 lines 206–208 */}
                            <div
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-base ${style.bg} ${style.text}`}
                            >
                                {icon}
                            </div>

                            {/* Heading — index2 line 209 */}
                            {block.heading && (
                                <HeadingTag className="mt-3 text-base font-semibold text-(--theme-heading)">
                                    {block.heading}
                                </HeadingTag>
                            )}

                            {/* Body — index2 line 210 */}
                            {block.body && (
                                <p className="mt-1 text-sm leading-relaxed text-(--theme-muted)">
                                    {block.body}
                                </p>
                            )}

                            {/* Items (inline bullets) */}
                            {block.items && block.items.length > 0 && (
                                <ul className="mt-3 space-y-1">
                                    {block.items.map((item, j) => (
                                        <li
                                            key={`${block.id}-item-${j}`}
                                            className={`flex items-center gap-2 text-sm ${style.text}`}
                                        >
                                            <span>{icon}</span>
                                            <span className="text-(--theme-text)">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// List group — index2 lines 238–309 (pricing/feature list cards)
// Consecutive list blocks → 2-col grid, alternating teal/orange checkmarks
// ---------------------------------------------------------------------------
function ListGroup({ blocks }: { blocks: SectionBlock[] }) {
    const gridCols = blocks.length === 1 ? "" : "md:grid-cols-2";

    return (
        <section className="space-y-6">
            <div className={`grid gap-4 ${gridCols}`}>
                {blocks.map((block, i) => {
                    // Alternate teal (even) / orange (odd) — mirrors index2 starter/team cards
                    const isAlt = i % 2 !== 0;
                    const checkColor = isAlt ? "text-(--theme-accent)" : "text-(--theme-brand)";
                    const borderClass = isAlt
                        ? "border-(--theme-accent)/30"
                        : "border-(--theme-border)";
                    const HeadingTag = block.headingLevel ?? "h3";

                    return (
                        <div
                            key={block.id}
                            className={`rounded-3xl border ${borderClass} bg-(--theme-surface) p-6 shadow-(--theme-shadow-soft) transition hover:shadow-lg`}
                        >
                            {/* Card header — index2 lines 258–264 */}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    {block.heading && (
                                        <HeadingTag className="text-base font-semibold text-(--theme-heading)">
                                            {block.heading}
                                        </HeadingTag>
                                    )}
                                    {block.body && (
                                        <p className="mt-1 text-sm text-(--theme-muted)">{block.body}</p>
                                    )}
                                </div>
                                {/* "Best value" / "Popular" badge — index2 lines 263, 289 */}
                                {block.items && block.items.length > 0 && (
                                    <span
                                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${isAlt
                                            ? "bg-(--theme-accent)/10 text-(--theme-accent)"
                                            : "bg-(--theme-brand)/10 text-(--theme-brand)"
                                            }`}
                                    >
                                        {block.items.length} items
                                    </span>
                                )}
                            </div>

                            {/* Checklist — index2 lines 271–275 */}
                            {block.items && block.items.length > 0 && (
                                <ul className="mt-5 space-y-2 text-sm text-(--theme-text)">
                                    {block.items.map((item, j) => (
                                        <li
                                            key={`${block.id}-li-${j}`}
                                            className="flex items-start gap-2"
                                        >
                                            <span className={`mt-0.5 shrink-0 font-bold ${checkColor}`}>
                                                ✓
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// CTA group — index2 lines 364–388
// Full-width teal-tinted card with heading + body
// Multiple CTA blocks stack vertically
// ---------------------------------------------------------------------------
function CtaGroup({ blocks }: { blocks: SectionBlock[] }) {
    return (
        <section className="space-y-4">
            {blocks.map((block) => {
                const HeadingTag = block.headingLevel ?? "h2";
                return (
                    <div
                        key={block.id}
                        className="grid items-center gap-6 rounded-3xl border border-(--theme-border) bg-(--theme-brand)/8 p-8 shadow-(--theme-shadow-soft) md:grid-cols-2"
                    >
                        {/* Left: heading + body — index2 lines 368–373 */}
                        <div>
                            {block.heading && (
                                <HeadingTag className="text-2xl font-semibold tracking-tight text-(--theme-heading)">
                                    {block.heading}
                                </HeadingTag>
                            )}
                            {block.body && (
                                <p className="mt-2 text-sm text-(--theme-muted)">{block.body}</p>
                            )}
                        </div>

                        {/* Right: numbered items — index2 step cards (lines 160–180) */}
                        {block.items && block.items.length > 0 && (
                            <div className="flex flex-col gap-3">
                                {block.items.map((item, j) => (
                                    <div
                                        key={`${block.id}-cta-${j}`}
                                        className="flex items-center gap-3 rounded-2xl border border-(--theme-border) bg-(--theme-surface) p-3 text-sm"
                                    >
                                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-(--theme-accent) text-xs font-semibold text-white">
                                            {j + 1}
                                        </span>
                                        <span className="text-(--theme-text)">{item}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </section>
    );
}
