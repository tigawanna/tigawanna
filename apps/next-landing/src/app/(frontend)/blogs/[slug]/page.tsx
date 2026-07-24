import { Suspense, ViewTransition } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getBlogBySlug, getBlogStaticParams } from "@/data-access/blogs";
import { ContentArticle } from "@/components/blogs/ContentArticle";
import { ContentArticleSkeleton } from "@/components/blogs/ContentArticleSkeleton";
import { RelatedBlogsSection } from "@/components/blogs/RelatedBlogsSection";
import { DirectionalPageTransition } from "@/components/view-transitions/DirectionalPageTransition";

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

  return (
    <ViewTransition enter="slide-up" default="none">
      <div data-test="blog-detail-page">
        <ContentArticle
          doc={blog}
          backHref="/blogs"
          backLabel="Back to blogs"
          dataTest="blog-detail"
          related={
            <RelatedBlogsSection
              slug={blog.slug}
              kind="post"
              tags={blog.tags}
              heading="More posts"
            />
          }
        />
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
      <Suspense fallback={<ContentArticleSkeleton backLabel="Back to blogs" showCover />}>
        <BlogDetail params={params} />
      </Suspense>
    </DirectionalPageTransition>
  );
}
