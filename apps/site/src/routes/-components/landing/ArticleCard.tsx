import type { DevtoArticle } from "@/types/devto";
import { ArrowUpRight } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface ArticleCardProps {
  article: DevtoArticle;
  className?: string;
}

export function ArticleCard({ article, className }: ArticleCardProps) {
  const imageUrl = article.social_image || article.cover_image;

  return (
    <article
      data-test="article-card"
      className={twMerge(
        "group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-[#f6efd7]/10 bg-[#1e2119] shadow-xl shadow-black/30",
        className,
      )}
    >
      <div className="relative h-44 shrink-0 overflow-hidden">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt={article.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e2119] via-[#1e2119]/20 to-transparent" />
          </>
        ) : (
          <div className="h-full bg-gradient-to-br from-[#2a2d24] to-[#1a1d16]" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6 pt-4">
        <h3 className="font-serif text-xl leading-snug tracking-[-0.02em] text-[#f6efd7]">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-[#c5ccb4]/80">{article.description}</p>

        {article.tag_list.length > 0 ? (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {article.tag_list.slice(0, 3).map((tag) => (
              <li
                key={tag}
                className="rounded-md bg-[#f6efd7]/[0.06] px-2.5 py-0.5 text-xs text-[#c5ccb4]/75"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-[#f6efd7]/8 pt-4 text-sm">
          <span className="text-xs text-[#c5ccb4]/50">
            {new Date(article.published_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {article.reading_time_minutes > 0 ? ` · ${article.reading_time_minutes} min` : null}
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#c5ccb4] transition-colors hover:text-[#f6efd7]"
          >
            Read
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
