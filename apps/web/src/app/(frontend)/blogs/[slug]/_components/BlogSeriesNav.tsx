import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { getBlogSeriesNav } from "@/data-access/blogs";
import { cn } from "@/lib/cn";

type BlogSeriesNavProps = {
  slug: string;
};

/**
 * Public URL for a blog post slug.
 */
function blogHref(slug: string): string {
  return `/blogs/${encodeURIComponent(slug)}`;
}

async function BlogSeriesNavContent({ slug }: BlogSeriesNavProps) {
  const series = await getBlogSeriesNav(slug);
  if (!series) return null;

  const { title, description, parts, currentIndex } = series;
  const previous = parts[currentIndex - 1];
  const next = parts[currentIndex + 1];

  return (
    <section
      data-test="blog-series"
      aria-labelledby="blog-series-heading"
      className="mt-16 rounded-2xl border border-base-content/10 bg-base-content/[0.03] p-5 md:p-8"
    >
      <p className="text-xs font-medium tracking-[0.18em] text-base-content/60 uppercase">
        Series · Part {currentIndex + 1} of {parts.length}
      </p>
      <h2
        id="blog-series-heading"
        className="mt-2 font-serif text-2xl font-semibold tracking-[-0.03em] md:text-3xl"
      >
        {title}
      </h2>
      {description ? <p className="mt-2 text-base-content/70">{description}</p> : null}

      <ol className="mt-6 space-y-1">
        {parts.map((part, index) => {
          const isCurrent = index === currentIndex;
          return (
            <li key={part.slug}>
              <Link
                href={blogHref(part.slug)}
                transitionTypes={[index < currentIndex ? "nav-back" : "nav-forward"]}
                aria-current={isCurrent ? "page" : undefined}
                data-test="blog-series-part"
                className={cn(
                  "flex items-baseline gap-3 rounded-lg px-3 py-2 transition-colors",
                  isCurrent
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-base-content/80 hover:bg-base-content/5 hover:text-base-content",
                )}
              >
                <span className="w-6 shrink-0 text-sm tabular-nums opacity-60">{index + 1}.</span>
                <span className="min-w-0">{part.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      <nav aria-label="Series navigation" className="mt-6 grid gap-3 sm:grid-cols-2">
        {previous ? (
          <Link
            href={blogHref(previous.slug)}
            transitionTypes={["nav-back"]}
            data-test="blog-series-prev"
            className="group flex flex-col gap-1 rounded-xl border border-base-content/10 p-4 transition-colors hover:border-primary/40"
          >
            <span className="flex items-center gap-1.5 text-xs text-base-content/60 uppercase">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              Previous
            </span>
            <span className="font-medium">{previous.title}</span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next ? (
          <Link
            href={blogHref(next.slug)}
            transitionTypes={["nav-forward"]}
            data-test="blog-series-next"
            className="group flex flex-col gap-1 rounded-xl border border-base-content/10 p-4 text-right transition-colors hover:border-primary/40 sm:col-start-2"
          >
            <span className="flex items-center justify-end gap-1.5 text-xs text-base-content/60 uppercase">
              Next
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="font-medium">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </section>
  );
}

/**
 * "Part N of M" series box with all parts and previous / next links.
 * Renders nothing for standalone posts.
 */
export function BlogSeriesNav(props: BlogSeriesNavProps) {
  return (
    <Suspense fallback={null}>
      <BlogSeriesNavContent {...props} />
    </Suspense>
  );
}
