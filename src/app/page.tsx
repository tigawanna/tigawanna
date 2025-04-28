import Intro from "@/components/Intro";
import { AboutLinks } from "@/components/about/AboutLinks";
import { DevToArticles } from "@/components/articles/DevToArticles";
import { ContactMeForm } from "@/components/contact/ContactMeForm";
import { CurrentlyWorkingOnGithubProjects } from "@/components/projects/repos/CurrentlyWorkingOnGithubProjects";
import {
  PinnedGithubProjects,
  ProjectsSuspenseFallback,
} from "@/components/projects/repos/PinnedGithubProjects";
import { MainFooter } from "@/components/shared/Footer";
import { GithubLanguages, LanguagesSuspenseFallback } from "@/components/stats/languages/Languages";
import { TechUsed } from "@/components/tech/TechUsed";
import { Suspense } from "react";
import { LessonsSection } from "./lessons/__components/LessonsSection";
import { getViewerRecentlyPushedRepos } from "@/state/api/repos";
import { ViewerGithubTech } from "@/components/projects/repos/ViewerGithubTech";


export const revalidate = 60;
export default async function Home() {
  const { data, errors } = await getViewerRecentlyPushedRepos();
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
      <TechUsed />
      <Suspense fallback={<ProjectsSuspenseFallback />}>
        <ViewerGithubTech data={data} errors={errors} />
      </Suspense>
      {/* <Projects/> */}
      <Suspense fallback={<ProjectsSuspenseFallback />}>
        <PinnedGithubProjects />
      </Suspense>
      <Suspense fallback={<ProjectsSuspenseFallback />}>
        <CurrentlyWorkingOnGithubProjects data={data} errors={errors} />
      </Suspense>
      <Suspense fallback={<ProjectsSuspenseFallback />}>
        <DevToArticles />
      </Suspense>
      {/*  lessons */}\
      <LessonsSection />
      <ContactMeForm />
      {/* <LibraryIcons/> */}
      {/* <Libraries data={libs}/> */}
      <MainFooter />
    </main>
  );
}
