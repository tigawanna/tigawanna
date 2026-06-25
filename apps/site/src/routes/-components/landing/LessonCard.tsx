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
        "flex min-h-[360px] flex-col overflow-hidden rounded-[2rem] border border-base-content/10 bg-base-300/60 shadow-xl shadow-black/10 transition-transform duration-300 hover:-translate-y-1",
        className,
      )}
    >
      <Link
        to="/lessons/$lessonId"
        params={{ lessonId: item.id }}
        className="flex flex-1 flex-col gap-3 p-6"
      >
        <h3 className="line-clamp-1 font-serif text-2xl leading-tight">{item.title}</h3>
        <p className="line-clamp-3 text-sm leading-6 text-base-content/70">{item.description}</p>

        <div className="flex items-center gap-2 text-sm text-base-content/60">
          <CalendarRange className="size-4" />
          {formattedDate}
        </div>

        {item.previewHtml ? (
          <div
            className="markdown line-clamp-[8] max-h-40 overflow-hidden text-sm text-base-content/80"
            dangerouslySetInnerHTML={{ __html: item.previewHtml }}
          />
        ) : null}
      </Link>

      {item.gist ? (
        <a
          href={item.gist}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 border-t border-base-content/10 py-3 text-sm text-primary transition-colors hover:bg-primary/5"
        >
          Gist
          <ExternalLink className="size-4" />
        </a>
      ) : null}
    </article>
  );
}
