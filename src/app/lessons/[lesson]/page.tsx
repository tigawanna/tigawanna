import { convertMarkdownToHtml } from "@/state/md/parse";
import { getOneLesson } from "../__components/api";
import { redirect } from "next/navigation";
import { CalendarRange, ChevronLeft } from "lucide-react";
import Link from "next/link";
interface PageProps {
  params: { lesson: string };
}
export default async function page({ params }: PageProps) {
  const item = await getOneLesson(params.lesson);
  if (!item) return redirect("/lessons");

  const output_html = convertMarkdownToHtml(item.markdown);
  const formatedDate = new Date(item.created).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className="w-full h-full flex flex-col items-center gap-2 justify-center">
      <Link className="hover:text-accent fixed top-[3%] left-[1%]" href="..">
        <ChevronLeft className="size-20" />
      </Link>

      <h2 className="text-6xl font-bold">{item.title}</h2>
      <p className="text-lg brightness-75">{item.description}</p>
      <div className="mb-4 flex items-center text-sm ">
        <span className="mr-2">
          <CalendarRange className="h-4 w-4" />
        </span>
        {formatedDate}
      </div>
      <div className="markdown " dangerouslySetInnerHTML={{ __html: output_html }} />
    </div>
  );
}
