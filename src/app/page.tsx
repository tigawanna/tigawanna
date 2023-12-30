import Intro from "@/components/Intro";
import { WhatIBuild } from "@/components/WhaIBuild/WhatIBuild";
import About from "@/components/about/About";
import { ContactMeForm } from "@/components/contact/ContactMeForm";
import { GithubProjects, ProjectsSuspenseFallback } from "@/components/repos/GithubProjects";
import { MainFooter } from "@/components/shared/Footer";
import { Suspense } from "react";
import { GithubStats } from "@/components/stats/GithubStats";

import { AboutLinks } from "@/components/about/AboutLinks";

export const revalidate = 60;
export default async function Home() {
 return (
   <main
     className="flex flex-col w-full min-h-screen h-full  lg:p-2 p-5  md:items-end 
     gap-5 
    ">
     <Intro />
     {/* <Navbar /> */}
     <AboutLinks/>
     <About />
     <GithubStats />
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


