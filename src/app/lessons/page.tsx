import { ListPagination } from "@/components/pagination/ReactresponsivePagination";
import { LessonsList } from "./__components/LessonsList";
import { Metadata } from "next";

export const revalidate = 10;
export const metadata: Metadata = {
  title: "Lessons",
  description: "  every bug is a lesson in disguise. Here are the pearls of wisdom I've gathered along the way",
};

interface PageProps {
  // params: { lesson: string };
  searchParams: { page: string | undefined };
}
export default async function LessonsPage({ searchParams }: PageProps) {
return (
  <div className="w-full h-full min-h-screen flex flex-col items-center justify-center">
    <header className="mb-12 text-center">
      <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
        You code you learn
      </h1>
      <p className="mx-auto max-w-2xl text-xl brightness-75 md:text-2xl">
        every bug is a lesson in disguise. Here are the pearls of wisdom I've gathered along the
        way.
      </p>
    </header>
    <div className="w-full h-full min-h-screen flex px-5">
      <LessonsList page={Number(searchParams.page) || 1} perPage={24} />
    </div>
  </div>
);
}
