import type { CSSProperties } from "react";

export const themeKeywords = [
  "ModernTech",
  "Scholarly",
  "Neural",
  "NeoScholarly",
  "Enterprise",
  "Government",
] as const;

export type SiteThemeKeyword = (typeof themeKeywords)[number];

type ThemeTokens = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  heading: string;
  accent: string;
  accentContrast: string;
  brand: string;
  brandContrast: string;
  glowA: string;
  glowB: string;
  border: string;
  bgImage: string;
  softShadow: string;
};

const themeMap: Record<SiteThemeKeyword, ThemeTokens> = {
  ModernTech: {
    bg: "#0b1220",
    surface: "rgba(17, 24, 39, 0.82)",
    text: "#cbd5e1",
    muted: "#94a3b8",
    heading: "#f8fafc",
    accent: "#38bdf8",
    accentContrast: "#042f4a",
    brand: "#0f7f73",
    brandContrast: "#ecfeff",
    glowA: "rgba(31, 160, 143, 0.22)",
    glowB: "rgba(56, 189, 248, 0.2)",
    border: "rgba(56, 189, 248, 0.32)",
    bgImage: "linear-gradient(140deg, #0b1220 0%, #0f172a 42%, #111827 100%)",
    softShadow: "0 14px 34px rgba(2, 6, 23, 0.32)",
  },
  Scholarly: {
    bg: "#f8f5ec",
    surface: "rgba(255, 255, 255, 0.8)",
    text: "#3f3a31",
    muted: "#6e675b",
    heading: "#1f1b15",
    accent: "#8b5e34",
    accentContrast: "#fff7ed",
    brand: "#5d4037",
    brandContrast: "#fef8f2",
    glowA: "rgba(139, 94, 52, 0.18)",
    glowB: "rgba(245, 158, 11, 0.16)",
    border: "rgba(139, 94, 52, 0.28)",
    bgImage: "linear-gradient(140deg, #f8f5ec 0%, #efe6d5 50%, #f8f5ec 100%)",
    softShadow: "0 14px 34px rgba(68, 64, 52, 0.14)",
  },
  Neural: {
    bg: "#0c0f14",
    surface: "rgba(18, 20, 27, 0.86)",
    text: "#d9dee8",
    muted: "#9aa5b5",
    heading: "#ffffff",
    accent: "#14b8a6",
    accentContrast: "#032724",
    brand: "#2563eb",
    brandContrast: "#eff6ff",
    glowA: "rgba(20, 184, 166, 0.24)",
    glowB: "rgba(37, 99, 235, 0.18)",
    border: "rgba(20, 184, 166, 0.35)",
    bgImage: "radial-gradient(circle at 15% 15%, #10242f 0%, #0c0f14 50%, #090b0f 100%)",
    softShadow: "0 14px 34px rgba(2, 6, 23, 0.35)",
  },
  NeoScholarly: {
    bg: "#f3f4f6",
    surface: "rgba(255, 255, 255, 0.78)",
    text: "#374151",
    muted: "#6b7280",
    heading: "#111827",
    accent: "#2563eb",
    accentContrast: "#eff6ff",
    brand: "#1d4ed8",
    brandContrast: "#eff6ff",
    glowA: "rgba(37, 99, 235, 0.18)",
    glowB: "rgba(15, 118, 110, 0.15)",
    border: "rgba(37, 99, 235, 0.22)",
    bgImage: "linear-gradient(155deg, #f3f4f6 0%, #e5e7eb 100%)",
    softShadow: "0 12px 30px rgba(15, 23, 42, 0.1)",
  },
  Enterprise: {
    bg: "#f7fafc",
    surface: "rgba(255, 255, 255, 0.9)",
    text: "#334155",
    muted: "#64748b",
    heading: "#0f172a",
    accent: "#f97316",
    accentContrast: "#fff7ed",
    brand: "#0f7f73",
    brandContrast: "#f0fdfa",
    glowA: "rgba(15, 127, 115, 0.16)",
    glowB: "rgba(249, 115, 22, 0.16)",
    border: "rgba(15, 118, 110, 0.26)",
    bgImage: "linear-gradient(135deg, #f7fafc 0%, #ecfeff 44%, #f0fdfa 100%)",
    softShadow: "0 12px 30px rgba(2, 6, 23, 0.08)",
  },
  Government: {
    bg: "#eef2f7",
    surface: "rgba(255, 255, 255, 0.88)",
    text: "#1f2937",
    muted: "#4b5563",
    heading: "#0b132b",
    accent: "#b91c1c",
    accentContrast: "#fef2f2",
    brand: "#1d4ed8",
    brandContrast: "#eff6ff",
    glowA: "rgba(29, 78, 216, 0.14)",
    glowB: "rgba(185, 28, 28, 0.12)",
    border: "rgba(185, 28, 28, 0.24)",
    bgImage: "linear-gradient(145deg, #eef2f7 0%, #dde6f0 100%)",
    softShadow: "0 12px 30px rgba(30, 41, 59, 0.1)",
  },
};



export function getThemeFromEnv(): SiteThemeKeyword {
  return "Enterprise";
}

export function getThemeStyles(theme: SiteThemeKeyword): CSSProperties {
  const tokens = themeMap[theme];

  return {
    "--theme-bg": tokens.bg,
    "--theme-surface": tokens.surface,
    "--theme-text": tokens.text,
    "--theme-muted": tokens.muted,
    "--theme-heading": tokens.heading,
    "--theme-accent": tokens.accent,
    "--theme-accent-contrast": tokens.accentContrast,
    "--theme-brand": tokens.brand,
    "--theme-brand-contrast": tokens.brandContrast,
    "--theme-glow-a": tokens.glowA,
    "--theme-glow-b": tokens.glowB,
    "--theme-border": tokens.border,
    "--theme-bg-image": tokens.bgImage,
    "--theme-shadow-soft": tokens.softShadow,
  } as CSSProperties;
}
