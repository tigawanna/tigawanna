import { convertMarkdownToHtml } from "@/state/md/parse";
import { getOneLesson } from "../__components/api";
import { redirect } from "next/navigation";
import { CalendarRange, ChevronLeft, ExternalLink } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
interface PageProps {
  params: { lesson: string };
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const item = await getOneLesson(params.lesson);
  return {
    title: item?.title,
    description: item?.description,

    openGraph: {
      title: item?.title,
      description: item?.description,
    },
  };
}
export const revalidate = 10;
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
      <div className="w-full  flex justify-evenly px=2 md:px-5  gap-3 pb-3">
        <Link className="hover:text-accent fixed md:sticky top-[1%] left-[1%] " href="..">
          <ChevronLeft className="size-14 md:size-20" />
        </Link>

        <h2 className="md:text-6xl text-5xl font-bold  max-w-[80%] text-center">{item.title}</h2>
      </div>
      <p className="text-lg brightness-75 px-2 max-w-[90%]">{item.description}</p>
      <div className="w-full flex gap-5 justify-center items-center max-w-[90%]">
        <div className=" flex items-center text-sm ">
          <span className="mr-2">
            <CalendarRange className="h-4 w-4" />
          </span>
          {formatedDate}
        </div>
        {item.gist && (
          <a
            href={item.gist}
            target="_blank"
            className="link hover:text-accent flex justify-center items-center gap-1">
            Gist <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
      <div className="markdown max-w-[90%]" dangerouslySetInnerHTML={{ __html: output_html }} />
    </div>
  );
}
