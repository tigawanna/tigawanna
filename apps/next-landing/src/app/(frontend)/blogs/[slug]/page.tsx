import { Suspense, ViewTransition } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { getBlogBySlug, getBlogStaticParams } from "@/data-access/blogs";
import { LandingFooter } from "@/components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { RichText } from "@/components/richtext/RichText";
import { DirectionalPageTransition } from "@/components/view-transitions/DirectionalPageTransition";
import { journalTitleVtName } from "@/components/view-transitions/names";

type Args = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getBlogStaticParams();
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const blog = await getBlogBySlug(decoded, { kind: "post" });
  if (!blog) {
    const journal = await getBlogBySlug(decoded, { kind: "journal" });
    if (journal) {
      return {
        title: journal.title,
        description: journal.description,
        alternates: { canonical: `/journals/${journal.slug}` },
      };
    }
    return { title: "Blog" };
  }

  return {
    title: blog.title,
    description: blog.description,
    alternates: {
      canonical: `/blogs/${blog.slug}`,
    },
  };
}

async function BlogDetail({ params }: Args) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const blog = await getBlogBySlug(decoded, { kind: "post" });
  if (!blog) {
    const journal = await getBlogBySlug(decoded, { kind: "journal" });
    if (journal) redirect(`/journals/${journal.slug}`);
    notFound();
  }

  const formattedDate = new Date(blog.publishedAt ?? blog.created).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ViewTransition enter="slide-up" default="none">
      <div data-test="blog-detail-page" className="min-h-screen bg-base-100 text-base-content">
        <LandingNavbar />
        <main className="min-h-screen py-24">
          <article className="mx-auto max-w-4xl px-6" data-test="blog-detail">
            <div className="mb-8">
              <Link
                href="/blogs"
                transitionTypes={["nav-back"]}
                className="inline-flex text-sm text-primary hover:underline"
              >
                Back to blogs
              </Link>
            </div>

            <p className="text-center text-[0.65rem] font-semibold tracking-[0.22em] text-primary uppercase">
              Post
            </p>

            <ViewTransition name={journalTitleVtName(blog.slug)} share="text-morph" default="none">
              <h1 className="mt-3 text-balance text-center font-serif text-5xl font-semibold tracking-[-0.04em] md:text-6xl">
                {blog.title}
              </h1>
            </ViewTransition>
            <p className="mx-auto mt-4 max-w-3xl text-center text-lg leading-8 text-base-content/70">
              {blog.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-base-content/70">
              <div className="flex items-center gap-2">
                <CalendarRange className="size-4" />
                {formattedDate}
              </div>
              {blog.tags.length > 0 ? (
                <ul className="flex flex-wrap justify-center gap-2">
                  {blog.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-base-content/10 px-2.5 py-0.5 text-xs text-base-content/55"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {blog.heroImageUrl ? (
              <div className="relative mt-10 aspect-video overflow-hidden rounded-2xl border border-base-content/10">
                <Image
                  src={blog.heroImageUrl}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                  priority
                />
              </div>
            ) : null}

            {blog.content ? (
              <div className="mt-12">
                <RichText data={blog.content} enableGutter={false} />
              </div>
            ) : null}
          </article>
        </main>
        <LandingFooter />
      </div>
    </ViewTransition>
  );
}

/**
 * Blog post detail — Lexical HTML from the Payload `blogs` collection.
 */
export default function BlogDetailPage({ params }: Args) {
  return (
    <DirectionalPageTransition>
      <Suspense
        fallback={
          <ViewTransition exit="slide-down" default="none">
            <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 py-24">
              <p className="text-sm text-base-content/60">Loading post…</p>
            </main>
          </ViewTransition>
        }
      >
        <BlogDetail params={params} />
      </Suspense>
    </DirectionalPageTransition>
  );
}
