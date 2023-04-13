import { Head, useSSQ } from "rakkasjs"
import About from "../components/about";
import { AboutLinks } from "../components/AboutLinks";
import Intro from "../components/intro";
import Projects from "../components/projects";
import { TechDetails } from "../components/TechDetails";
import { ErrorOutput } from "../shared/ErrorOutput";
import { getAllReposPkgJson, getPackgeJson, sanitizePackageNames } from "../util/getPackge";



export default function HomePage() {


	// const { data, dataUpdatedAt, } = useSSQ(() => {
	// 	return getAllReposPkgJson()
	// }
	// )
	// console.log("package.json  data ==== ", data)

	
	// if (data?.message && data?.documentation_url) {
	// 	return <ErrorOutput error={data}/>
	// }

sanitizePackageNames()
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
