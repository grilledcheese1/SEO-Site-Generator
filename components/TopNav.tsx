"use client";

import Link from "next/link";
import { useState } from "react";

import type { SiteNavItem } from "@/lib/content/types";

type TopNavProps = {
  siteName: string;
  navItems: SiteNavItem[];
};

/**
 * Sticky top nav matching index2.html lines 56–95.
 * - Desktop: logo left | nav links center | CTA button right
 * - Mobile:  logo left | hamburger right → collapsible drawer
 */
export default function TopNav({ siteName, navItems }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleItems = navItems.slice(0, 5);
  const ctaPath =
    visibleItems.find((item) => item.path.includes("contact"))?.path ??
    "/contact";

  return (
    <header className="sticky top-0 z-40 border-b border-(--theme-border) bg-(--theme-surface)/95 backdrop-blur-md">
      {/* ── Main bar ───────────────────────────────────────────────────── */}
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        {/* Logo — index2 lines 58–67 */}
        <Link
          href="/"
          className="inline-flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-(--theme-surface)"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-(--theme-brand) text-sm font-semibold text-white shadow-(--theme-shadow-soft)">
            SO
          </span>
          <span className="leading-tight">
            <span className="block font-semibold tracking-tight text-(--theme-heading)">
              {siteName}
            </span>
            <span className="block text-xs text-(--theme-muted)">
              SSR Content Experience
            </span>
          </span>
        </Link>

        {/* Desktop nav — index2 lines 69–73 */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="text-(--theme-muted) transition-colors hover:text-(--theme-heading)"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* CTA button — index2 lines 76–79 */}
          <Link
            href={ctaPath}
            className="inline-flex items-center justify-center rounded-xl bg-(--theme-brand) px-4 py-2 text-sm font-semibold text-white shadow-(--theme-shadow-soft) transition hover:brightness-105"
          >
            Get Started
          </Link>

          {/* Hamburger — index2 lines 81–83, visible only on mobile */}
          <button
            id="mobileMenuBtn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex items-center justify-center rounded-xl border border-(--theme-border) bg-(--theme-surface) p-2 text-(--theme-muted) shadow-sm hover:bg-(--theme-surface)/80 md:hidden"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer — index2 lines 88–94 ──────────────────────── */}
      {menuOpen && (
        <div className="border-t border-(--theme-border) bg-(--theme-surface) md:hidden">
          <div className="mx-auto grid max-w-6xl gap-1 px-4 py-3 sm:px-6">
            {visibleItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm text-(--theme-muted) hover:bg-(--theme-bg) hover:text-(--theme-heading)"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
