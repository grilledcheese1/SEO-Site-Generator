import { z } from "zod";

export const pageKindSchema = z.enum(["home", "about", "blog", "reviews", "contact", "page"]);

export const sectionBlockSchema = z.object({
  id: z.string().min(1).catch("unknown-id"),
  type: z.enum(["hero", "text", "list", "cta"]).catch("text"),
  heading: z.string().optional(),
  headingLevel: z.enum(["h1", "h2", "h3"]).optional(),
  body: z.string().optional(),
  items: z.array(z.string()).optional(),
});

export const contactSignalsSchema = z.object({
  phones: z.array(z.string()).default([]),
  emails: z.array(z.string()).default([]),
  addresses: z.array(z.string()).default([]),
});

export const pageContentBlocksSchema = z.object({
  sections: z.array(sectionBlockSchema).default([]).catch([]),
  h1: z.string().default("").catch(""),
  h2: z.array(z.string()).default([]).catch([]),
  h3: z.array(z.string()).default([]).catch([]),
  paragraphs: z.array(z.string()).default([]).catch([]),
  bullets: z.array(z.string()).default([]).catch([]),
  contactSignals: contactSignalsSchema.default({
    phones: [],
    emails: [],
    addresses: [],
  }).catch({
    phones: [],
    emails: [],
    addresses: [],
  }),
});

export const siteNavItemSchema = z.object({
  label: z.string().min(1),
  path: z.string().min(1),
});

export const ingestedPageSchema = z.object({
  path: z.string().min(1),
  url: z.url(),
  title: z.string().min(1),
  description: z.string().default(""),
  canonical: z.url().optional(),
  kind: pageKindSchema,
  og: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      url: z.string().optional(),
      image: z.string().optional(),
    })
    .optional(),
  twitter: z
    .object({
      card: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    })
    .optional(),
  content: pageContentBlocksSchema,
  extractedAt: z.string(),
  navigation: z.array(siteNavItemSchema).optional(),
  isSPAWarning: z.boolean().optional(),
});

export const siteMetadataSchema = z.object({
  siteName: z.string().default(""),
  defaultTitle: z.string().default(""),
  defaultDescription: z.string().default(""),
  locale: z.string().default("en-US"),
  organizationName: z.string().optional(),
  phones: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  sameAs: z.array(z.string()).optional(),
});

export const crawlFiltersSchema = z.object({
  allowPatterns: z.array(z.string()).default([]),
  denyPatterns: z.array(z.string()).default([]),
});

export const siteContentSchema = z.object({
  baseUrl: z.url(),
  generatedAt: z.string(),
  metadata: siteMetadataSchema,
  nav: z.object({
    primary: z.array(siteNavItemSchema).default([]),
    footer: z.array(siteNavItemSchema).default([]),
  }),
  filters: crawlFiltersSchema.default({
    allowPatterns: [],
    denyPatterns: [],
  }),
  pages: z.array(ingestedPageSchema).default([]),
  errors: z.array(z.string()).default([]),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
export type IngestedPage = z.infer<typeof ingestedPageSchema>;
export type SectionBlock = z.infer<typeof sectionBlockSchema>;

