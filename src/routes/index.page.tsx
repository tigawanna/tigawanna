import { Head, Link } from "rakkasjs"
import { IconContext } from "react-icons/lib";
import { FaLinkedinIn, FaGithub, FaDev } from 'react-icons/fa'
import About from "../components/about";
import Intro from "../components/intro";
import Projects, { Project } from "../components/projects";

export default function HomePage() {



	return (
		<main>
			<Head title="Dennis Kinuthia"/>
			<main className="flex w-full h-[100%] flex-col bg-slate-700">
				<Intro />

				<div className="flex justify-end  w-[100%] p-1 sticky top-0 z-50 bg-slate-700">
					<div className='p-1 m-1 flex '>
						<IconContext.Provider
							value={{ size: "30px", className: "mx-2" }}>

							<div className='my-2 md:my-0 text-sm md:text-lg  text-slate-300 font-mono'>

								<Link href="https://github.com/tigawanna"
								><a target="_blank" className="text-green-400">
										<FaGithub />
									</a></Link>
							</div>

							<div className='my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono'>
								<Link href="https://linkedin.com/in/dennis-kinuthia" >
									<a target="_blank" className="text-green-400">
										<FaLinkedinIn />
									</a></Link>
							</div>

							<div className='my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono'>
								<Link href="https://dev.to/tigawanna" >
									<a target="_blank" className="text-green-400">
										<FaDev />
									</a></Link>
							</div>

						</IconContext.Provider>
					</div>
				</div>

				<About />
				<Projects />
			</main>
		</main>
	);
}
