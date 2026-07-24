import { Suspense, ViewTransition } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarRange, ExternalLink } from "lucide-react";
import { getJournalBySlug, getJournalStaticParams } from "@/data-access/journals";
import { LandingFooter } from "@/components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { RichText } from "@/components/richtext/RichText";
import { DirectionalPageTransition } from "@/components/view-transitions/DirectionalPageTransition";
import { journalTitleVtName } from "@/components/view-transitions/names";

type Args = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getJournalStaticParams();
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const journal = await getJournalBySlug(decodeURIComponent(slug));
  if (!journal) return { title: "Journal" };

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
  const journal = await getJournalBySlug(decodeURIComponent(slug));
  if (!journal) notFound();

  const formattedDate = new Date(journal.publishedAt ?? journal.created).toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <ViewTransition enter="slide-up" default="none">
      <div data-test="journal-detail-page" className="min-h-screen bg-base-100 text-base-content">
        <LandingNavbar />
        <main className="min-h-screen py-24">
          <article className="mx-auto max-w-4xl px-6" data-test="journal-detail">
            <div className="mb-8">
              <Link
                href="/journals"
                transitionTypes={["nav-back"]}
                className="inline-flex text-sm text-primary hover:underline"
              >
                Back to journals
              </Link>
            </div>

            <p className="text-center text-[0.65rem] font-semibold tracking-[0.22em] text-primary uppercase">
              {journal.kind === "post" ? "Post" : "TIL"}
            </p>

            <ViewTransition name={journalTitleVtName(journal.slug)} share="text-morph" default="none">
              <h1 className="mt-3 text-balance text-center font-serif text-5xl font-semibold tracking-[-0.04em] md:text-6xl">
                {journal.title}
              </h1>
            </ViewTransition>
            <p className="mx-auto mt-4 max-w-3xl text-center text-lg leading-8 text-base-content/70">
              {journal.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-base-content/70">
              <div className="flex items-center gap-2">
                <CalendarRange className="size-4" />
                {formattedDate}
              </div>
              {journal.gist ? (
                <a
                  href={journal.gist}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Gist
                  <ExternalLink className="size-4" />
                </a>
              ) : null}
            </div>

            {journal.heroImageUrl ? (
              <div className="relative mt-10 aspect-video overflow-hidden rounded-2xl border border-base-content/10">
                <Image
                  src={journal.heroImageUrl}
                  alt={journal.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                  priority
                />
              </div>
            ) : null}

            {journal.content ? (
              <div className="mt-12">
                <RichText data={journal.content} enableGutter={false} />
              </div>
            ) : journal.markdown ? (
              <pre className="mt-10 overflow-x-auto whitespace-pre-wrap rounded-lg border border-base-content/10 bg-base-200/40 p-6 font-sans text-sm leading-7 text-base-content/80">
                {journal.markdown}
              </pre>
            ) : null}
          </article>
        </main>
        <LandingFooter />
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
