import { convertMarkdownToHtml } from "@/state/md/parse";
import { LessonsItem } from "./api";
import Link from "next/link";
import { CalendarRange, ChevronRight } from "lucide-react";
export function LessonCard({ item }: { item: LessonsItem }) {
  const output_html = convertMarkdownToHtml(item.markdown);
  const formatedDate = new Date(item.created).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <Link
      href={`/lessons/${item.id}`}
      className="card w-full sm:h-[350px] 
        md:w-[48%] lg:w-[28%] shadow-lg shadow-base-200 p-2 rounded-xl flex flex-col gap-0.5">
      <h2 className="text-2xl font-bold">{item.title}</h2>
      <p className="text-sm brightness-75">{item.description}</p>
      <div className="mb-4 flex items-center text-sm ">
        <span className="mr-2">
          <CalendarRange className="h-4 w-4" />
        </span>
     {  formatedDate}
      </div>
      <div className="markdown max-h-52" dangerouslySetInnerHTML={{ __html: output_html }} />
    </Link>
  );
}
