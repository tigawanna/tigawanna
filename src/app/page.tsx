import Intro from "@/components/Intro";
import About from "@/components/about/About";
import { AboutLinks } from "@/components/about/AboutLinks";
import { Languages } from "@/components/languages/Languages";
import { getViewerLangs } from "@/components/languages/helpers";
import { Libraries } from "@/components/pkgs/Libraries";
import { getFavDeps } from "@/components/pkgs/helpers";
import Projects from "@/components/projects/Projects";
import { GithubProjects } from "@/components/repos/GithubProjects";
import { MainFooter } from "@/components/shared/Footer";
import { getViwerPinnedRepos } from "@/state/api/repos";


export default async function Home() {
  const langs = await getViewerLangs()
  const libs = await getFavDeps(process.env.GH_PAT);
  const data = await getViwerPinnedRepos()
  return (
    <main className="flex w-full min-h-screen p-2 md:p-5 flex-col items-center justify-between 
    	bg-gradient-to-tr from-green-900 via-transparent to-emerald-700 gap-5
    ">
      <Intro/>
      <AboutLinks />
      <About/>
      <Languages data={langs}/>
      {/* <Projects/> */}
      <GithubProjects data={data}/>
      <Libraries data={libs}/>
      <MainFooter/>
      
    </main>
  )
}
