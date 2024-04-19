import Image from "next/image";
import {
	FaAndroid,
	FaApple,
	FaGlobe,
	FaReact,
	FaServer,
	FaTerminal,
} from "react-icons/fa";
import { SectionHeader } from "../shared/SectionHeader";

type WhatIBuildProps = {};

export function WhatIBuild({}: WhatIBuildProps) {
	return (
		<div className="w-full h-full   flex flex-col items-center justify-center relative lg:px-[10%]">
			<SectionHeader heading="I Build " id="ibuild" />
			<Image
				priority
				src="/blobby.svg"
				alt="bllobby background"
				height={1000}
				width={1000}
				className="h-full w-full object-fit   absolute top-0 bottom-0 "
			/>
			<div className="w-full h-full flex  left-0 right-0 p-5 bg-opacity-30 z-10 text-sm">
				<div className="w-full  flex justify-center items-center flex-col gap-5">
					{/* <h2 className="text-4xl font-bold py-7"> I build</h2> */}
					<div className="flex flex-col items-center justify-center md:w-[60%]">
						<div className="w-full flex flex-wrap justify-center p-5 gap-5 ">
							<div
								className=" w-full sm:w-[45%] lg:w-[45%] h-52 rounded-lg p-1
              border border-base-200 bg-base-200 flex flex-col justify-center items-center gap-1"
							>
								<span className="flex justify-center items-center gap-2">
									<FaReact className="h-20 w-20" />
									<FaGlobe className="h-5 w-5" />
								</span>
								<h2 className="text-xl font-bold">Websites</h2>
								<p className="text-sm w-[90%] text-center">
									Fullstack React websites using Nextjs + NodeJS apis
								</p>
							</div>

							<div
								className=" w-full sm:w-[45%] lg:w-[35%] h-52 rounded-lg p-1
              border border-base-200 bg-base-200 flex flex-col justify-center items-center gap-1"
							>
								<span className="flex gap-5">
									<FaServer className="h-20 w-20" />
								</span>
								<h2 className="text-xl font-bold">Backends</h2>
								<p className="text-sm w-[90%] text-center">
									Server side applications with Nodejs and Deno
								</p>
							</div>

							<div
								className=" w-full sm:w-[45%] lg:w-[35%] h-52 rounded-lg p-1
              border border-base-200 bg-base-200 flex flex-col justify-center items-center gap-1"
							>
								<span className="flex gap-5">
									<FaServer className="h-20 w-20" />
								</span>
								<h2 className="text-xl font-bold">Database Driven solutions</h2>
								<p className="text-sm w-[90%] text-center">
									Postgres,SQlite,Mongodb ,Redis. Leveraging ORMs like
									Prisma,Drizzle,TypeORM
								</p>
							</div>
							<div
								className=" w-full sm:w-[45%] lg:w-[35%] h-52 rounded-lg p-1
              border border-base-200 bg-base-200 flex flex-col justify-center items-center gap-1"
							>
								<span className="flex gap-5">
									<FaServer className="h-20 w-20" />
								</span>
								<h2 className="text-xl font-bold">BaaS soluitons</h2>
								<p className="text-sm w-[90%] text-center">
									Using Supabase and Firebase for quick MVPs and low
									maintainance backend solutions
								</p>
							</div>

							<div
								className=" w-full sm:w-[45%] lg:w-[35%] h-52 rounded-lg p-1
              border border-base-200 bg-base-200 flex flex-col justify-center items-center gap-1"
							>
								<div className="flex gap-2 items-center">
									<FaReact className="h-20 w-20" />
									<div className="gap-2">
										<FaApple className="h-5 w-5" />
										<FaAndroid className="h-5 w-5" />
									</div>
								</div>
								<h2 className="text-xl font-bold">Native Apps</h2>
								<p className="text-sm w-[90%] text-center">
									Native apps using React Native and Expo
								</p>
							</div>

							<div
								className=" w-full sm:w-[45%] lg:w-[35%] h-52 rounded-lg p-1
              border border-base-200 bg-base-200 flex flex-col justify-center items-center gap-1"
							>
								<span className="flex gap-5">
									<FaTerminal className="h-20 w-20" />
								</span>
								<h2 className="text-xl font-bold">CLI tools</h2>
								<p className="text-sm w-[90%] text-center">
									Command line utilities with Deno and nodejs
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
