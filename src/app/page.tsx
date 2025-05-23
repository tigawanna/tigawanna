import Intro from "@/components/landing-page/Intro";
import { AboutLinks } from "@/components/landing-page/about/AboutLinks";
import { DevToArticles } from "@/components/landing-page/articles/DevToArticles";
import { ContactMeForm } from "@/components/landing-page/contact/ContactMeForm";
import { CurrentlyWorkingOnGithubProjects } from "@/components/landing-page/projects/repos/CurrentlyWorkingOnGithubProjects";
import {
  ProjectsSuspenseFallback,
} from "@/components/landing-page/projects/repos/PinnedGithubProjects";
import { MainFooter } from "@/components/shared/Footer";
import { GithubLanguages, LanguagesSuspenseFallback } from "@/components/landing-page/stats/languages/Languages";
import { Suspense } from "react";
import { LessonsSection } from "./lessons/__components/LessonsSection";
import { getViewerPinnedRepos, getViewerRecentlyPushedRepos } from "@/state/api/repos";
import { ViewerGithubProjects } from "@/components/landing-page/projects/repos/ViewerGithubProjects";

export interface PageProps {
  params: Promise<{ topic: string }>;
}


export const revalidate = 60;
export default async function Home({}: PageProps) {
  const { data, errors } = await getViewerRecentlyPushedRepos();
  const pinned = await getViewerPinnedRepos();

  return (
    <main
      className="flex flex-col w-full  h-full  lg:p-2 p-5  md:items-end 
     gap-10 
    ">
      <Intro />
      {/* <Navbar /> */}
      <AboutLinks />
      {/* <About /> */}
      {/* <GithubStats /> */}
      <Suspense fallback={<LanguagesSuspenseFallback />}>
        <GithubLanguages />
      </Suspense>
      {/* <Suspense fallback={<TopLibrariesSuspenseFallback />}>
       <GithubStats />
     </Suspense> */}
      {/* <WhatIBuild /> */}
      {/* <TechUsed /> */}
      <Suspense fallback={<ProjectsSuspenseFallback />}>
        <ViewerGithubProjects
          data={data}
          errors={errors}
          pinned={pinned}
        />
      </Suspense>
      {/* <Projects/> */}
      {/* <Suspense fallback={<ProjectsSuspenseFallback />}>
        <PinnedGithubProjects />
      </Suspense> */}
      <Suspense fallback={<ProjectsSuspenseFallback />}>
        <CurrentlyWorkingOnGithubProjects data={data} errors={errors} />
      </Suspense>
      <Suspense fallback={<ProjectsSuspenseFallback />}>
        <DevToArticles />
      </Suspense>
      {/*  lessons */}
      <LessonsSection />
      <ContactMeForm />
      {/* <LibraryIcons/> */}
      {/* <Libraries data={libs}/> */}
      <MainFooter />
    </main>
  );
}
