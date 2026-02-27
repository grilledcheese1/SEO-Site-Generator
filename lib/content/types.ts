export type PageKind = "home" | "about" | "blog" | "reviews" | "contact" | "page";

export type SectionBlockType = "hero" | "text" | "list" | "cta";

export type SectionBlock = {
  id: string;
  type: SectionBlockType;
  heading?: string;
  headingLevel?: "h1" | "h2" | "h3";
  body?: string;
  items?: string[];
};

export type SiteMetadata = {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  locale: string;
  organizationName?: string;
  phones?: string[];
  languages?: string[];
  sameAs?: string[];
};

export type SiteNavItem = {
  label: string;
  path: string;
};

export type SiteNav = {
  primary: SiteNavItem[];
  footer: SiteNavItem[];
};

export type ContactSignals = {
  phones: string[];
  emails: string[];
  addresses: string[];
};

export type OpenGraphSignals = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
};

export type TwitterSignals = {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
};

export type PageContentBlocks = {
  /** Ordered, typed section blocks — primary source of truth for rendering. */
  sections: SectionBlock[];
  /** Legacy flat fields — kept for backward compatibility. */
  h1: string;
  h2: string[];
  h3: string[];
  paragraphs: string[];
  bullets: string[];
  contactSignals: ContactSignals;
};

export type IngestedPage = {
  path: string;
  url: string;
  title: string;
  description: string;
  canonical?: string;
  kind: PageKind;
  og?: OpenGraphSignals;
  twitter?: TwitterSignals;
  content: PageContentBlocks;
  extractedAt: string;
  navigation?: SiteNavItem[];
  isSPAWarning?: boolean;
};

export type CrawlFilters = {
  allowPatterns: string[];
  denyPatterns: string[];
};

export type SiteContent = {
  baseUrl: string;
  generatedAt: string;
  metadata: SiteMetadata;
  nav: SiteNav;
  filters: CrawlFilters;
  pages: IngestedPage[];
  errors: string[];
};

