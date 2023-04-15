import { Head, useSSQ } from "rakkasjs"
import About from "../components/about";
import { AboutLinks } from "../components/AboutLinks";
import Intro from "../components/intro";
import Projects from "../components/projects";
import { TechDetails } from "../components/TechDetails";
import { getAllReposPkgJson, getRepoPackageJson } from "../state/user-tools/user-packages";




export default function HomePage() {


	// const { data, dataUpdatedAt, } = useSSQ(() => {
	// 	return getAllReposPkgJson()
	// }
	// )
	// console.log("package.json  data ==== ", data)

	

	return (
		<main>
			<Head title="Dennis Kinuthia"/>
			<main className="flex w-full h-[100%] flex-col font-serif 
			bg-gradient-to-br from-green-900 via-transparent to-emerald-100
			">
				<Intro />
				<AboutLinks/>
				<TechDetails/>
				<About />
				<Projects />
			</main>
		</main>
	);
}
