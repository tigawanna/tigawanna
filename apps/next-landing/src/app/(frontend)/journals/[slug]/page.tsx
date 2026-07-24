import { Suspense, ViewTransition } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getBlogBySlug, getRelatedBlogs } from "@/data-access/blogs";
import { getJournalBySlug, getJournalStaticParams } from "@/data-access/journals";
import { ContentArticle } from "@/components/blogs/ContentArticle";
import { DirectionalPageTransition } from "@/components/view-transitions/DirectionalPageTransition";

type Args = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getJournalStaticParams();
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const journal = await getJournalBySlug(decoded);
  if (!journal) {
    const post = await getBlogBySlug(decoded, { kind: "post" });
    if (post) {
      return {
        title: post.title,
        description: post.description,
        alternates: { canonical: `/blogs/${post.slug}` },
      };
    }
    return { title: "Journal" };
  }

  return {
    title: journal.title,
    description: journal.description,
    alternates: {
      canonical: `/journals/${journal.slug}`,
    },
  };
}

async function JournalDetail({ params }: Args) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const journal = await getJournalBySlug(decoded);
  if (!journal) {
    const post = await getBlogBySlug(decoded, { kind: "post" });
    if (post) redirect(`/blogs/${post.slug}`);
    notFound();
  }

  const related = await getRelatedBlogs({
    slug: journal.slug,
    kind: "journal",
    tags: journal.tags,
    limit: 3,
  });

  return (
    <ViewTransition enter="slide-up" default="none">
      <div data-test="journal-detail-page">
        <ContentArticle
          doc={journal}
          backHref="/journals"
          backLabel="Back to journals"
          dataTest="journal-detail"
          related={related}
          relatedHeading="More TILs"
          asideHref={journal.gist}
          asideLabel="Gist"
          fallbackBody={
            journal.markdown ? (
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-base-content/10 bg-base-200/40 p-6 font-sans text-sm leading-7 text-base-content/80">
                {journal.markdown}
              </pre>
            ) : null
          }
        />
      </div>
    </ViewTransition>
  );
}

/**
 * Journal detail — Lexical HTML from Payload, or static markdown fallback.
 */
export default function JournalDetailPage({ params }: Args) {
  return (
    <DirectionalPageTransition>
      <Suspense
        fallback={
          <ViewTransition exit="slide-down" default="none">
            <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 py-24">
              <p className="text-sm text-base-content/60">Loading journal…</p>
            </main>
          </ViewTransition>
        }
      >
        <JournalDetail params={params} />
      </Suspense>
    </DirectionalPageTransition>
  );
}
