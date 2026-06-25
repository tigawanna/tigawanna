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
        "group overflow-hidden rounded-[2rem] border border-[#1b1d14]/10 bg-[#f6efd7]/80 shadow-xl shadow-[#1b1d14]/10 transition-transform duration-300 hover:-translate-y-1",
        className,
      )}
    >
      <div className="relative h-44 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full bg-[#1b1d14]/10" />
        )}
      </div>

      <div className="flex flex-col gap-4 p-6">
        <h3 className="font-serif text-2xl leading-tight tracking-[-0.02em]">{article.title}</h3>
        <p className="line-clamp-2 text-sm leading-6 text-[#1b1d14]/70">{article.description}</p>

        <div className="flex items-center justify-between gap-3 pt-1 text-sm">
          <span className="text-[#1b1d14]/60">
            {new Date(article.published_at).toLocaleDateString()}
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#687054] transition-colors hover:text-[#1b1d14]"
          >
            Read
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
