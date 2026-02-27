import { toAbsoluteUrl } from "@/lib/seo/canonical";

type OrganizationInput = {
  baseUrl: string;
  name: string;
  phones?: string[];
  languages?: string[];
  sameAs?: string[];
};

type WebPageInput = {
  baseUrl: string;
  path: string;
  title: string;
  description: string;
};

type BreadcrumbInput = {
  baseUrl: string;
  pathSegments: string[];
};

export function makeOrganizationLegalService(input: OrganizationInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LegalService"],
    name: input.name,
    url: toAbsoluteUrl(input.baseUrl, "/"),
    ...(input.phones && input.phones.length > 0 ? { telephone: input.phones } : {}),
    ...(input.languages && input.languages.length > 0
      ? { availableLanguage: input.languages }
      : {}),
    ...(input.sameAs && input.sameAs.length > 0 ? { sameAs: input.sameAs } : {}),
  };
}

export function makeWebPage(input: WebPageInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: toAbsoluteUrl(input.baseUrl, input.path),
    name: input.title,
    description: input.description,
  };
}

export function makeBreadcrumbList(input: BreadcrumbInput): Record<string, unknown> {
  const itemListElement = input.pathSegments.map((segment, index) => {
    const partialPath = `/${input.pathSegments.slice(0, index + 1).join("/")}`;
    const label = segment
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return {
      "@type": "ListItem",
      position: index + 1,
      name: label,
      item: toAbsoluteUrl(input.baseUrl, partialPath),
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

