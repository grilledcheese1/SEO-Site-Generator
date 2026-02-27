import type { Metadata } from "next";

import Schema from "@/components/Schema";
import SiteFooter from "@/components/SiteFooter";
import TopNav from "@/components/TopNav";
import { getSiteContent } from "@/lib/content/read";
import { makeOrganizationLegalService } from "@/lib/seo/jsonld";
import { getSeoConfigFromEnv } from "@/lib/seo/metadataDefaults";
import { getThemeFromEnv, getThemeStyles } from "@/lib/theme/siteTheme";

const FALLBACK_BASE_URL = "http://localhost:3000";
const seo = getSeoConfigFromEnv();
const metadataBase = process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_BASE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(metadataBase),
  title: {
    default: seo.defaultTitle,
    template: seo.titleTemplate,
  },
  description: seo.defaultDescription,
  keywords: [
    "personal injury lawyer",
    "accident attorney",
    "car accident lawyer",
    "injury law firm",
    "wrongful death attorney",
    "abogado de lesiones personales",
    "abogado de accidentes",
    "abogado de choques",
    "firma legal de lesiones personales",
    "consulta gratis abogado",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: seo.siteName,
    title: seo.openGraphTitle,
    description: seo.openGraphDescription,
    locale: "en_US",
    images: seo.defaultOgImage ? [seo.defaultOgImage] : undefined,
  },
  twitter: {
    card: seo.twitterCard,
    title: seo.twitterTitle,
    description: seo.twitterDescription,
    images: seo.defaultOgImage ? [seo.defaultOgImage] : undefined,
  },
};

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = await getSiteContent();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? site.baseUrl ?? FALLBACK_BASE_URL;
  const theme = getThemeFromEnv();
  const themeStyles = getThemeStyles(theme);
  const siteName = site.metadata.siteName || seo.siteName;

  const organizationJsonLd = makeOrganizationLegalService({
    baseUrl,
    name: site.metadata.organizationName || siteName,
    phones: site.metadata.phones,
    languages: site.metadata.languages,
    sameAs: site.metadata.sameAs,
  });

  return (
    <div
      data-theme={theme}
      style={themeStyles}
      className="relative min-h-screen overflow-x-clip bg-(--theme-bg) bg-[image:--theme-bg-image) text--(--theme-text)"
    >
      <Schema json={organizationJsonLd} />

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-(--theme-glow-a) blur-3xl" />
        <div className="absolute -bottom-28 right-1/3 h-72 w-72 rounded-full bg-(--theme-glow-b) blur-3xl" />
      </div>

      <TopNav siteName={siteName} navItems={site.nav.primary} />
      {children}
      <SiteFooter siteName={siteName} navItems={site.nav.footer} />
    </div>
  );
}
