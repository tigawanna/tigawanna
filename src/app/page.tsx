import Intro from "@/components/landing-page/Intro";
import { AboutLinks } from "@/components/landing-page/about/AboutLinks";
import { DevToArticles } from "@/components/landing-page/articles/DevToArticles";
import { ContactMeForm } from "@/components/landing-page/contact/ContactMeForm";
import { CurrentlyWorkingOnGithubProjects } from "@/components/landing-page/projects/repos/CurrentlyWorkingOnGithubProjects";
import {
  PinnedGithubProjects,
  ProjectsSuspenseFallback,
} from "@/components/landing-page/projects/repos/PinnedGithubProjects";
import { MainFooter } from "@/components/landing-page/shared/Footer";
import { GithubLanguages, LanguagesSuspenseFallback } from "@/components/landing-page/stats/languages/Languages";
import { TechUsed } from "@/components/landing-page/tech/TechUsed";
import { Suspense } from "react";
import { LessonsSection } from "./lessons/__components/LessonsSection";
import { getViewerRecentlyPushedRepos } from "@/state/api/repos";
import { ViewerGithubTech } from "@/components/landing-page/projects/repos/ViewerGithubTech";


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
      {/* <TechUsed /> */}
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
