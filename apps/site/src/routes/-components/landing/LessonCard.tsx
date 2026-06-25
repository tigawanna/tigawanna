import type { LessonPreviewItem } from "@/types/lessons";
import { Link } from "@tanstack/react-router";
import { CalendarRange, ExternalLink } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface LessonCardProps {
  item: LessonPreviewItem;
  className?: string;
}

export function LessonCard({ item, className }: LessonCardProps) {
  const formattedDate = new Date(item.created).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article
      data-test="lesson-card"
      className={twMerge(
        "flex min-h-[360px] flex-col overflow-hidden rounded-[2rem] border border-[#f6efd7]/15 bg-[#2a2d24] shadow-xl shadow-black/20",
        className,
      )}
    >
      <Link
        to="/lessons/$lessonId"
        params={{ lessonId: item.id }}
        className="flex flex-1 flex-col gap-3 p-6 text-[#f6efd7]"
      >
        <h3 className="line-clamp-1 font-serif text-2xl leading-tight text-[#f6efd7]">
          {item.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-6 text-[#f6efd7]/85">{item.description}</p>

        <div className="flex items-center gap-2 text-sm text-[#f6efd7]/75">
          <CalendarRange className="size-4" />
          {formattedDate}
        </div>

        {item.previewHtml ? (
          <div
            className="markdown markdown-on-panel line-clamp-[8] max-h-40 overflow-hidden text-sm text-[#f6efd7]/90"
            dangerouslySetInnerHTML={{ __html: item.previewHtml }}
          />
        ) : null}
      </Link>

      {item.gist ? (
        <a
          href={item.gist}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 border-t border-[#f6efd7]/15 py-3 text-sm text-[#c5ccb4] transition-colors hover:bg-[#f6efd7]/5 hover:text-[#f6efd7]"
        >
          Gist
          <ExternalLink className="size-4" />
        </a>
      ) : null}
    </article>
  );
}
