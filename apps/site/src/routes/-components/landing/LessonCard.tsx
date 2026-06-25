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
        "flex flex-col overflow-hidden rounded-[1.75rem] rounded-bl-[2.5rem] shadow-xl shadow-black/30",
        cardSurfaces[tone],
        className,
      )}
    >
      <Link
        to="/lessons/$lessonId"
        params={{ lessonId: item.id }}
        className="flex flex-1 flex-col gap-4 p-6"
      >
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

        {item.previewHtml ? (
          <div className="relative mt-1">
            <div
              className="markdown markdown-on-panel max-h-28 overflow-hidden rounded-xl border border-[#f6efd7]/6 bg-[#151811]/90 p-4 text-xs leading-5 [&_h2]:mb-2 [&_h2]:text-[0.65rem] [&_h2]:font-semibold [&_h2]:tracking-[0.16em] [&_h2]:text-[#687054] [&_h2]:uppercase [&_p]:mb-2 [&_p]:text-[#c5ccb4]/65 [&_pre.shiki]:m-0 [&_pre.shiki]:overflow-x-auto [&_pre.shiki]:rounded-lg [&_pre.shiki]:p-3 [&_pre.shiki]:text-[0.68rem] [&_pre.shiki]:leading-5 [&_pre]:mt-1 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:text-[0.68rem] [&_pre]:leading-5"
              dangerouslySetInnerHTML={{ __html: item.previewHtml }}
            />
            <div
              className={twMerge(
                "pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t to-transparent",
                previewFades[tone],
              )}
              aria-hidden="true"
            />
          </div>
        ) : null}
      </Link>

      <div className="flex items-center justify-between gap-3 border-t border-[#f6efd7]/8 px-6 py-4">
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
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}
