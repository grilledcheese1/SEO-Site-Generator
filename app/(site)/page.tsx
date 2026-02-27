import { notFound } from "next/navigation";

import Breadcrumbs from "@/components/Breadcrumbs";
import ContentSections from "@/components/ContentSections";
import PageHero from "@/components/PageHero";
import Prose from "@/components/Prose";
import Schema from "@/components/Schema";
import { getPageByPath, getSiteContent } from "@/lib/content/read";
import { makeWebPage } from "@/lib/seo/jsonld";

export default async function HomePage() {
  const site = await getSiteContent();
  const page = await getPageByPath("/");

  if (!page) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? site.baseUrl;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 lg:px-8">
      <article className="rounded-3xl border border-(--theme-border) bg-(--theme-surface) px-6 py-8 shadow-(--theme-shadow-soft) backdrop-blur-sm lg:px-10">

        <Schema
          json={
            makeWebPage({
              baseUrl,
              path: "/",
              title: page.title,
              description: page.description,
            })
          }
        />
        <Breadcrumbs path="/" />
        <PageHero title={page.title} subtitle={page.description} />
        {page.content.sections.length > 0 ? (
          <ContentSections sections={page.content.sections} />
        ) : (
          <Prose blocks={page.content} />
        )}
      </article>
    </main>
  );
}

