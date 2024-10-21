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
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GithubLanguages, LanguagesSuspenseFallback } from "@/components/stats/languages/Languages";
import { TechUsed } from "@/components/tech/TechUsed";
import { Suspense } from "react";
import { LessonsList } from "./lessons/__components/LessonsList";
import { LessonsSection } from "./lessons/__components/LessonsSection";

export const revalidate = 60;
export default async function Home() {
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
      {/* <Projects/> */}
      <Suspense fallback={<ProjectsSuspenseFallback />}>
        <PinnedGithubProjects />
      </Suspense>
      <Suspense fallback={<ProjectsSuspenseFallback />}>
        <CurrentlyWorkingOnGithubProjects />
      </Suspense>
      <Suspense fallback={<ProjectsSuspenseFallback />}>
        <DevToArticles />
      </Suspense>
      {/*  lessons */}\
        <LessonsSection/>
      <ContactMeForm />
      {/* <LibraryIcons/> */}
      {/* <Libraries data={libs}/> */}
      <MainFooter />
    </main>
  );
}
