import Intro from "@/components/Intro";
import { WhatIBuild } from "@/components/WhaIBuild/WhatIBuild";
import About from "@/components/about/About";
import { AboutLinks } from "@/components/about/AboutLinks";
import { ContactMeForm } from "@/components/contact/ContactMeForm";
import { Languages, LanguagesSuspenseFallback } from "@/components/stats/languages/Languages";
import { GithubProjects, ProjectsSuspenseFallback } from "@/components/repos/GithubProjects";
import { MainFooter } from "@/components/shared/Footer";
import { Suspense } from "react";
import { GithubStats } from "@/components/stats/GithubStats";

export const revalidate = 60;
export default async function Home() {
 return (
    <main
      className="flex w-full min-h-screen p-2 md:p-5 flex-col items-center justify-between 
    	bg-gradient-to-tr from-green-900 via-transparent to-emerald-700 gap-5 
    ">

      <Intro />
      <AboutLinks />
      <About />
      <GithubStats/>
      <WhatIBuild />
      {/* <Projects/> */}
      <Suspense fallback={<ProjectsSuspenseFallback />}>
        <GithubProjects />
      </Suspense>
      <ContactMeForm />
      {/* <Libraries data={libs}/> */}
      <MainFooter />
    </main>
  );
}


