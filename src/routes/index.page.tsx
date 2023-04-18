import { Head, useSSQ } from "rakkasjs"
import About from "../components/about";
import { AboutLinks } from "../components/AboutLinks";
import Intro from "../components/intro";
import Projects from "../components/projects";
import { Libraries } from "../components/technoligies/Libraries";
import { JsonView } from "../components/JsonView";





export default function HomePage() {


	// const { data, dataUpdatedAt, } = useSSQ(() => {
	// 	return getAllReposPkgJson()
	// }
	// )
	// console.log("package.json  data ==== ", data)

	
	// groupPackages()
	
	return (
		<main>
			<Head title="Dennis Kinuthia"/>
			<main className="flex w-full h-[100%] flex-col font-serif 
			bg-gradient-to-br from-green-900 via-transparent to-emerald-100
			">
				<Intro />
				<JsonView/>
				<AboutLinks/>
				<About />
			
				<Projects />
			</main>
		</main>
	);
}
