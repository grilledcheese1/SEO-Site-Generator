import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Breadcrumbs from "@/components/Breadcrumbs";
import PageHero from "@/components/PageHero";
import Prose from "@/components/Prose";
import Schema from "@/components/Schema";
import { getPageByPath, getSiteContent } from "@/lib/content/read";
import { toAbsoluteUrl } from "@/lib/seo/canonical";
import { makeBreadcrumbList, makeWebPage } from "@/lib/seo/jsonld";
import {
  getSeoConfigFromEnv,
  optimizeSeoDescription,
  optimizeSeoTitle,
} from "@/lib/seo/metadataDefaults";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

function normalizeSlug(slug: string[] | undefined): string {
  if (!slug || slug.length === 0) {
    return "/";
  }

  return `/${slug.join("/")}`;
}

async function getResolvedPage(slug: string[] | undefined) {
  const path = normalizeSlug(slug);
  const page = await getPageByPath(path);
  return { path, page };
}

function getSeoOverrides() {
  const overrideCard = process.env.SEO_OVERRIDE_TWITTER_CARD;

  return {
    title: process.env.SEO_OVERRIDE_TITLE,
    description: process.env.SEO_OVERRIDE_DESCRIPTION,
    ogTitle: process.env.SEO_OVERRIDE_OG_TITLE,
    ogDescription: process.env.SEO_OVERRIDE_OG_DESCRIPTION,
    ogImage: process.env.SEO_OVERRIDE_OG_IMAGE,
    twitterTitle: process.env.SEO_OVERRIDE_TWITTER_TITLE,
    twitterDescription: process.env.SEO_OVERRIDE_TWITTER_DESCRIPTION,
    twitterCard:
      overrideCard === "summary" || overrideCard === "summary_large_image"
        ? overrideCard
        : undefined,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSiteContent();
  const { path, page } = await getResolvedPage(slug);
  const seo = getSeoConfigFromEnv();
  const overrides = getSeoOverrides();

  if (!page) {
    return {
      title: seo.defaultTitle || "Page Not Found",
      description: seo.defaultDescription,
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? site.baseUrl;
  const canonical = toAbsoluteUrl(baseUrl, page.canonical ?? path);

  const optimizedTitle = optimizeSeoTitle(page.title, seo.defaultTitle);
  const optimizedDescription = optimizeSeoDescription(page.description, seo.defaultDescription);

  const title = overrides.title ?? optimizedTitle;
  const description = overrides.description ?? optimizedDescription;

  const openGraphTitle = overrides.ogTitle ?? optimizeSeoTitle(page.og?.title ?? title, seo.openGraphTitle);
  const openGraphDescription =
    overrides.ogDescription ??
    optimizeSeoDescription(page.og?.description ?? description, seo.openGraphDescription);
  const openGraphImage = overrides.ogImage ?? page.og?.image ?? seo.defaultOgImage;

  const twitterTitle =
    overrides.twitterTitle ?? optimizeSeoTitle(page.twitter?.title ?? title, seo.twitterTitle);
  const twitterDescription =
    overrides.twitterDescription ??
    optimizeSeoDescription(page.twitter?.description ?? description, seo.twitterDescription);
  const twitterCard = overrides.twitterCard ?? page.twitter?.card ?? seo.twitterCard;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: openGraphTitle,
      description: openGraphDescription,
      url: canonical,
      images: openGraphImage ? [openGraphImage] : undefined,
    },
    twitter: {
      card: twitterCard === "summary_large_image" ? "summary_large_image" : "summary",
      title: twitterTitle,
      description: twitterDescription,
      images: openGraphImage ? [openGraphImage] : undefined,
    },
  };
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug } = await params;
  const site = await getSiteContent();
  const { path, page } = await getResolvedPage(slug);

  if (!page) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? site.baseUrl;
  const breadcrumbSegments = path.split("/").filter(Boolean);

  const webPageSchema = makeWebPage({
    baseUrl,
    path,
    title: page.title,
    description: page.description,
  });

  const breadcrumbSchema = makeBreadcrumbList({
    baseUrl,
    pathSegments: breadcrumbSegments,
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 lg:px-8">
      <article className="rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-6 py-8 shadow-[var(--theme-shadow-soft)] backdrop-blur-sm lg:px-10">
        <Schema json={webPageSchema} />
        <Schema json={breadcrumbSchema} />
        <Breadcrumbs path={path} />
        <PageHero title={page.title} subtitle={page.description} />
        <Prose blocks={page.content} />
      </article>
    </main>
  );
}

