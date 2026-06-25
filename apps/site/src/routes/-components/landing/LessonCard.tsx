import type { LessonPreviewItem } from "@/types/lessons";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { twMerge } from "tailwind-merge";

const cardSurfaces = [
  "border-[#f6efd7]/10 bg-[#1e2119]",
  "border-[#687054]/25 bg-[#1f241c]",
  "border-[#f6efd7]/8 bg-[#22241c]",
] as const;

const previewFades = ["from-[#1e2119]", "from-[#1f241c]", "from-[#22241c]"] as const;

interface LessonCardProps {
  item: LessonPreviewItem;
  className?: string;
  tone?: 0 | 1 | 2;
}

export function LessonCard({ item, className, tone = 0 }: LessonCardProps) {
  const formattedDate = new Date(item.created).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article
      data-test="lesson-card"
      className={twMerge(
        "group flex flex-col overflow-hidden rounded-t-[1.75rem] shadow-xl shadow-black/30",
        cardSurfaces[tone],
        className,
      )}
    >
      <div className="flex flex-col gap-3 p-6 pb-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[0.65rem] font-semibold tracking-[0.22em] text-[#687054] uppercase">
            {item.type}
          </span>
          <time className="text-xs text-[#c5ccb4]/45">{formattedDate}</time>
        </div>

        <h3 className="line-clamp-2 font-serif text-xl leading-snug tracking-[-0.02em] text-[#f6efd7]">
          {item.title}
        </h3>

        <p className="line-clamp-2 text-sm leading-6 text-[#c5ccb4]/75">{item.description}</p>

        <div className="flex items-center justify-between gap-3 pt-1">
          <Link
            to="/lessons/$lessonId"
            params={{ lessonId: item.id }}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#c5ccb4] transition-colors hover:text-[#f6efd7]"
          >
            Read
            <ArrowUpRight className="size-3.5" />
          </Link>

          {item.gist ? (
            <a
              href={item.gist}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#c5ccb4]/50 transition-colors hover:text-[#f6efd7]"
            >
              Gist
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>
      </div>

      {item.previewHtml ? (
        <Link
          to="/lessons/$lessonId"
          params={{ lessonId: item.id }}
          className="relative mt-auto block"
          aria-label={`Read lesson: ${item.title}`}
        >
          <div
            className="markdown markdown-on-panel max-h-[7.5rem] overflow-hidden [&_blockquote]:hidden [&_h2]:hidden [&_li]:hidden [&_p]:hidden [&_pre.shiki]:rounded-none [&_pre.shiki]:border-0 [&_pre.shiki]:p-0 [&_pre.shiki]:text-[0.6rem] [&_pre.shiki]:leading-[1.35] [&_pre.shiki_.line]:text-[0.6rem] [&_pre.shiki_code]:block [&_pre.shiki_code]:px-0 [&_pre.shiki_code]:pt-2 [&_pre.shiki_code]:pb-0 [&_pre]:rounded-none [&_pre]:p-0"
            dangerouslySetInnerHTML={{ __html: item.previewHtml }}
          />
          <div
            className={twMerge(
              "pointer-events-none absolute inset-x-0 bottom-0 flex h-12 items-end justify-center bg-gradient-to-t to-transparent pb-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
              previewFades[tone],
            )}
            aria-hidden="true"
          >
            <span className="inline-flex items-center gap-1 text-[0.65rem] font-medium text-[#f6efd7]/90">
              Read lesson
              <ArrowUpRight className="size-3" />
            </span>
          </div>
          <div
            className={twMerge(
              "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t to-transparent",
              previewFades[tone],
            )}
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </article>
  );
}
