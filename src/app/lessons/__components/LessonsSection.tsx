import { ProjectsSuspenseFallback } from "@/components/landing-page/projects/repos/CurrentlyWorkingOnGithubProjects";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Suspense } from "react";
import { LessonsList } from "./LessonsList";
import Link from "next/link";

interface LessonsSectionProps {}

export function LessonsSection({}: LessonsSectionProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center lg:px-[10%]">
      <SectionHeader heading="Cool thing i recently learned" id="journal" />
      <Suspense fallback={<ProjectsSuspenseFallback />}>
        <div className="w-full flex flex-col justify-center">
          <LessonsList perPage={6} />
          <Link className="text-accent text-lg hover:underline w-full text-center" href="/lessons">
            see more
          </Link>
        </div>
      </Suspense>
    </div>
  );
}
