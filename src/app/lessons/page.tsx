import { SectionHeader } from "@/components/shared/SectionHeader";
import { LessonsList } from "./__components/LessonsList";
import {  ChevronLeft } from "lucide-react";
import Link from "next/link";

export const revalidate = 10;
export default async function LessonsPage(){

return (
  <div className="w-full h-full min-h-screen flex flex-col items-center justify-center">
    <Link className="hover:text-accent fixed top-[3%] left-[1%]" href="..">
      <ChevronLeft className="size-20" />
    </Link>
    <header className="mb-12 text-center">
      <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
        You code you learn
      </h1>
      <p className="mx-auto max-w-2xl text-xl brightness-75 md:text-2xl">
        every bug is a lesson in disguise. Here are the pearls of wisdom I've gathered along the
        way.
      </p>
    </header>
    <div className="w-full h-full min-h-screen flex px-5">
      <LessonsList perPage={24} />
    </div>
  </div>
);
}
