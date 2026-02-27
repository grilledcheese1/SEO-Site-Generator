export type SeoConfig = {
  siteName: string;
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  openGraphTitle: string;
  openGraphDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterCard: "summary" | "summary_large_image";
  defaultOgImage?: string;
};

const DEFAULTS: SeoConfig = {
  siteName: "McHazlett Law Firm",
  titleTemplate: "%s | McHazlett Law Firm",
  defaultTitle: "McHazlett Law Firm | Personal Injury Lawyer | Abogado de Lesiones Personales",
  defaultDescription:
    "Legal services and representation. Experienced personal injury lawyer. Abogado de lesiones personales especializado en accidentes y compensacion.",
  openGraphTitle: "Personal Injury Lawyer | McHazlett Law Firm",
  openGraphDescription:
    "Experienced personal injury lawyer helping accident victims recover compensation. Free consultations. Car accidents, truck accidents, wrongful death, and serious injury cases.",
  twitterTitle: "Personal Injury Lawyer | McHazlett Law Firm",
  twitterDescription:
    "Injured in an accident? Get trusted legal representation from an experienced personal injury attorney. Free consultation available.",
  twitterCard: "summary_large_image",
};

function clean(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized || undefined;
}

export function getSeoConfigFromEnv(): SeoConfig {
  const twitterCard = process.env.SEO_TWITTER_CARD;
  const resolvedTwitterCard =
    twitterCard === "summary" || twitterCard === "summary_large_image"
      ? twitterCard
      : DEFAULTS.twitterCard;

  return {
    siteName: clean(process.env.SEO_SITE_NAME) ?? DEFAULTS.siteName,
    titleTemplate: clean(process.env.SEO_TITLE_TEMPLATE) ?? DEFAULTS.titleTemplate,
    defaultTitle: clean(process.env.SEO_DEFAULT_TITLE) ?? DEFAULTS.defaultTitle,
    defaultDescription: clean(process.env.SEO_DEFAULT_DESCRIPTION) ?? DEFAULTS.defaultDescription,
    openGraphTitle: clean(process.env.SEO_OG_TITLE) ?? DEFAULTS.openGraphTitle,
    openGraphDescription: clean(process.env.SEO_OG_DESCRIPTION) ?? DEFAULTS.openGraphDescription,
    twitterTitle: clean(process.env.SEO_TWITTER_TITLE) ?? DEFAULTS.twitterTitle,
    twitterDescription: clean(process.env.SEO_TWITTER_DESCRIPTION) ?? DEFAULTS.twitterDescription,
    twitterCard: resolvedTwitterCard,
    defaultOgImage: clean(process.env.SEO_DEFAULT_OG_IMAGE),
  };
}

export function optimizeSeoTitle(value: string, fallback: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return fallback;
  }

  return normalized
    .replace(/\s+\|\s+McHazlett Law Firm.*$/i, "")
    .replace(/\s+-\s+McHazlett Law Firm.*$/i, "")
    .trim();
}

export function optimizeSeoDescription(value: string, fallback: string): string {
  const normalized = value.replace(/\s+/g, " ").trim() || fallback;
  if (normalized.length <= 158) {
    return normalized;
  }

  return `${normalized.slice(0, 157).trimEnd()}...`;
}
