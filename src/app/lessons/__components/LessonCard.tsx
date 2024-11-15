import { convertMarkdownToHtml } from "@/state/md/parse";
import { LessonsItem } from "./api";
import Link from "next/link";
import { CalendarRange, ChevronRight, ExternalLink } from "lucide-react";
export function LessonCard({ item }: { item: LessonsItem }) {
  const output_html = convertMarkdownToHtml(item.markdown);
  const formatedDate = new Date(item.created).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div
      className="card w-full sm:h-[410px]  transition-transform hover:text-accent 
      hover:shadow-sm hover:shadow-accent duration-300 ease-in-out
        md:w-[48%] lg:w-[30%] shadow-lg shadow-base-200 p-1 rounded-xl flex flex-col gap-0.5">
      <Link href={`/lessons/${item.id}`} className=" p-3 rounded-xl flex flex-col gap-0.5">
        <h2 className="text-2xl font-bold line-clamp-1">{item.title}</h2>{" "}
        <p className="text-sm brightness-75 line-clamp-3">{item.description}</p>
        <div className="mb-4 flex items-center text-sm ">
          <span className="mr-2">
            <CalendarRange className="h-4 w-4" />
          </span>
          {formatedDate}
        </div>
        <div className="markdown max-h-52" dangerouslySetInnerHTML={{ __html: output_html }} />
      </Link>
      {item.gist && (
        <a
          href={item.gist}
          target="_blank"
          className="link hover:text-accent flex justify-center items-center gap-1">
          link <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
