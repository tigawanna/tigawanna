import { Head, Link, useLocation, useSSQ } from "rakkasjs"
import About from "../components/about";
import { AboutLinks } from "../components/AboutLinks";
import Intro from "../components/intro";
import Projects, { Project } from "../components/projects";
import {  getViewerLangs } from "../util/gql";


export default function HomePage() {
const location = useLocation()
console.log("location.current.href", location.current.href)
const {data,dataUpdatedAt,} = useSSQ(()=>{
	return getViewerLangs()
}
)
console.log("data==== ",data)
	return (
		<main>
			<Head title="Dennis Kinuthia"/>
			<main className="flex w-full h-[100%] flex-col font-serif
				bg-gradient-to-br from-green-900 via-transparent to-emerald-100	
			">
				<Intro />
				<AboutLinks/>
				<About />
				<Projects />
			</main>
		</main>
	);
}
