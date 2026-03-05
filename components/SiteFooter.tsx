import Link from "next/link";

import type { SiteNavItem } from "@/lib/validation/schemas";

type SiteFooterProps = {
  siteName: string;
  navItems: SiteNavItem[];
};

export default function SiteFooter({ siteName, navItems }: SiteFooterProps) {
  return (
    <footer className="border-t border-[var(--theme-border)] bg-[var(--theme-surface)]/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-[var(--theme-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} {siteName}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {navItems.slice(0, 4).map((item) => (
            <Link key={item.path} href={item.path} className="hover:text-[var(--theme-heading)]">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
