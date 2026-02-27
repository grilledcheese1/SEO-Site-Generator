import type { PageContentBlocks } from "@/lib/content/types";

type ProseProps = {
  blocks: PageContentBlocks;
};

export default function Prose({ blocks }: ProseProps) {
  const sparseParagraphs = blocks.paragraphs.length <= Math.max(1, Math.floor(blocks.h2.length / 2));

  return (
    <div className="space-y-8 text-base leading-8 text-[var(--theme-text)]">
      {sparseParagraphs && blocks.h2.length > 0 ? (
        <section aria-label="Highlights" className="grid gap-3 md:grid-cols-2">
          {blocks.h2.map((heading, i) => (
            <h2
              key={`h2-${i}-${heading}`}
              className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-xl font-semibold tracking-tight text-[var(--theme-heading)]"
            >
              {heading}
            </h2>
          ))}
        </section>
      ) : null}

      {blocks.h3.length > 0 ? (
        <section className="space-y-3">
          {blocks.h3.map((heading, i) => (
            <h3 key={`h3-${i}-${heading}`} className="text-xl font-semibold text-[var(--theme-heading)]">
              {heading}
            </h3>
          ))}
        </section>
      ) : null}

      {blocks.paragraphs.length > 0 ? (
        <section className="space-y-4">
          {blocks.paragraphs.map((paragraph, index) => (
            <p key={`p-${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
          ))}
        </section>
      ) : null}

      {blocks.bullets.length > 0 ? (
        <section className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5">
          <ul className="list-disc space-y-2 pl-6 marker:text-[var(--theme-accent)]">
            {blocks.bullets.map((item, i) => (
              <li key={`bullet-${i}-${item.slice(0, 24)}`}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
