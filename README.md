# McHazlett Law Firm (Next.js App Router)

## Local Development

```bash
npm run dev
```

## Ingestion + SEO Workflow

The site content is ingested from `https://mchazlettlawfirm.com` and normalized into `content/site.json`.
TypeScript scripts under `scripts/` are run with `tsx` because Node does not execute `.ts` files directly.

```bash running locally
npm run ingest
npm run seo-audit
npm run dev
```

Optional sitemap debug report:

```bash
npm run sitemap
```

## Environment Variables

- `TARGET_SITE_URL` (default: `https://mchazlettlawfirm.com`)
- `INGEST_MAX_ROUTES` (default: `200`)
- `INGEST_TIMEOUT_MS` (default: `15000`)
- `INGEST_DELAY_MS` (default: `400`)
- `INGEST_ALLOW_PATTERNS` (comma-separated regex patterns)
- `INGEST_DENY_PATTERNS` (comma-separated regex patterns)
- `NEXT_PUBLIC_SITE_URL` (used for canonical URLs/metadata)
- `NEXT_PUBLIC_SITE_TEMPLATE` (optional theme keyword: `ModernTech`, `Scholarly`, `Neural`, `NeoScholarly`, `Enterprise`, `Government`)

### Optional SEO Override Variables

These can be set in `.env.local` to override extracted SEO values without changing ingestion:

- `SEO_SITE_NAME`
- `SEO_TITLE_TEMPLATE`
- `SEO_DEFAULT_TITLE`
- `SEO_DEFAULT_DESCRIPTION`
- `SEO_OG_TITLE`
- `SEO_OG_DESCRIPTION`
- `SEO_TWITTER_TITLE`
- `SEO_TWITTER_DESCRIPTION`
- `SEO_DEFAULT_OG_IMAGE`
- `SEO_TWITTER_CARD` (`summary` or `summary_large_image`)
- `SEO_OVERRIDE_TITLE`
- `SEO_OVERRIDE_DESCRIPTION`
- `SEO_OVERRIDE_OG_TITLE`
- `SEO_OVERRIDE_OG_DESCRIPTION`
- `SEO_OVERRIDE_OG_IMAGE`
- `SEO_OVERRIDE_TWITTER_TITLE`
- `SEO_OVERRIDE_TWITTER_DESCRIPTION`
- `SEO_OVERRIDE_TWITTER_CARD` (`summary` or `summary_large_image`)

Example `.env.local`:

```env
TARGET_SITE_URL=https://mchazlettlawfirm.com
NEXT_PUBLIC_SITE_URL=https://www.mchazlettlaw.com

SEO_DEFAULT_TITLE=Personal Injury Lawyer in Texas | McHazlett Law Firm
SEO_DEFAULT_DESCRIPTION=Experienced personal injury representation for accident victims in Texas.
SEO_DEFAULT_OG_IMAGE=https://www.mchazlettlaw.com/og-default.jpg
SEO_OVERRIDE_TWITTER_CARD=summary_large_image
```

## Allow/Deny Patterns

Routing filters are config-driven from ingestion env vars:

- `INGEST_ALLOW_PATTERNS`: include-only patterns (optional)
- `INGEST_DENY_PATTERNS`: excluded route patterns

Denied patterns are also respected by:

- `app/robots.ts`
- `app/sitemap.ts`

## SSR + SEO Features

- SSR-first rendering in App Router route group `app/(site)`
- Catch-all content renderer: `app/(site)/[...slug]/page.tsx`
- Static + dynamic metadata via Next Metadata API
- Canonical normalization utilities in `lib/seo/canonical.ts`
- JSON-LD generation in `lib/seo/jsonld.ts`
- Organization schema injection in `app/(site)/layout.tsx`
- Page + breadcrumb JSON-LD in `app/(site)/[...slug]/page.tsx`
- Crawl directives in `app/robots.ts`
- XML sitemap route in `app/sitemap.ts`

## Production-style build
- npm run build
- npm run start

## Deploy

1. Set `NEXT_PUBLIC_SITE_URL` to the production origin.
2. Ensure ingestion runs during build (`npm run build` already chains `ingest` + `seo-audit`).
3. Deploy as a standard Next.js app.
