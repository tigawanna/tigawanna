import { Head } from "rakkasjs"
import About from "../components/about/About";
import { AboutLinks } from "../components/about/AboutLinks";
import Intro from "../components/Intro";
import Projects from "../components/projects/Projects";






export default function HomePage() {

	return (
		<main>
			<Head title="Dennis Kinuthia" />
			<main className="w-full h-[100%] flex  flex-col font-serif 
			bg-gradient-to-br from-green-900 via-transparent to-emerald-100
			">
			<Intro />
			<AboutLinks />
			<About />
			<Projects />
			</main>
		</main>
	);
}
