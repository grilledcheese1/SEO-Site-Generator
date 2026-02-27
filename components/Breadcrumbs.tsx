import Link from "next/link";

type BreadcrumbsProps = {
  path: string;
};

type BreadcrumbItem = {
  label: string;
  href: string;
};

function toLabel(segment: string): string {
  return segment
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function makeBreadcrumbItems(path: string): BreadcrumbItem[] {
  const segments = path.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

  segments.forEach((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    items.push({ label: toLabel(segment), href });
  });

  return items;
}

export default function Breadcrumbs({ path }: BreadcrumbsProps) {
  const items = makeBreadcrumbItems(path);

  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-sm text-[var(--theme-muted)]">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-2">
              {isCurrent ? (
                <span aria-current="page" className="font-medium text-[var(--theme-heading)]">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-[var(--theme-accent)] hover:underline">
                  {item.label}
                </Link>
              )}
              {!isCurrent ? <span aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
