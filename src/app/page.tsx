import Intro from "@/components/Intro";
import About from "@/components/about/About";
import { AboutLinks } from "@/components/about/AboutLinks";
import { Languages } from "@/components/languages/Languages";
import { getViewerLangs } from "@/components/languages/helpers";
import { Libraries } from "@/components/pkgs/Libraries";
import { getFavDeps } from "@/components/pkgs/helpers";
import Projects from "@/components/projects/Projects";
import { MainFooter } from "@/components/shared/Footer";


export default async function Home() {
  const langs = await getViewerLangs()
  const libs = await getFavDeps(process.env.GH_PAT);
  return (
    <main className="flex w-full min-h-screen p-5 flex-col items-center justify-between 
    	bg-gradient-to-tr from-green-900 via-transparent to-emerald-700 gap-5
    ">
      <Intro/>
      <AboutLinks />
      <About/>
      <Languages data={langs}/>
      <Projects/>
      <Libraries data={libs}/>
      <MainFooter/>
      
    </main>
  )
}
