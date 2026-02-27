type PageHeroProps = {
  title: string;
  subtitle?: string;
};

/**
 * Full-width hero section matching index2.html lines 97–193.
 * Teal glow blob top-center, orange glow blob bottom-right,
 * badge pill, large h1, and subtitle paragraph.
 */
export default function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden pb-6 pt-10">
      {/* Glow blobs — index2 lines 99–102 */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-(--theme-brand)/15 blur-3xl" />
        <div className="absolute -bottom-28 right-1/3 h-80 w-80 rounded-full bg-(--theme-accent)/15 blur-3xl" />
      </div>

      {/* Badge pill — index2 lines 107–110 */}
      <div className="inline-flex items-center gap-2 rounded-full border border-(--theme-border) bg-(--theme-brand)/5 px-3 py-1 text-xs font-medium text-(--theme-muted)">
        <span className="h-2 w-2 rounded-full bg-(--theme-accent)" />
        Ingested and rendered server-side
      </div>

      {/* H1 — index2 line 112 */}
      <h1 className="mt-5 text-4xl font-bold tracking-tight text-(--theme-heading) sm:text-5xl">
        {title}
      </h1>

      {/* Subtitle paragraph — index2 line 116 */}
      {subtitle && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-(--theme-muted)">
          {subtitle}
        </p>
      )}
    </section>
  );
}
