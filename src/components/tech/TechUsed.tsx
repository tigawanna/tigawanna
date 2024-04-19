import {
	SiApollographql,
	SiDeno,
	SiExpo,
	SiExpress,
	SiFastify,
	SiFirebase,
	SiGraphql,
	SiMongodb,
	SiNestjs,
	SiNodedotjs,
	SiPocketbase,
	SiPostgresql,
	SiReact,
	SiReactquery,
	SiSqlite,
	SiSupabase,
	SiTailwindcss,
	SiTypescript,
	SiVite,
} from "react-icons/si";
import { SectionHeader } from "../shared/SectionHeader";

import React from "react";

type TechUsedProps = {};

interface Circle {
	data: { name: string; icon: string };
	depth: number;
	height: number;
	width: number;
	r: number;
	value: number;
	x: number;
	y: number;
}

export function TechUsed({}: TechUsedProps) {
	return (
		<div className="w-full h-full  flex flex-col items-center justify-center lg:px-[10%] px-2">
			<SectionHeader heading="Technologies" id="tech" />
			<div className="w-full h-fit flex flex-wrap items-center justify-center gap-5">
				{tech_used.map((tech, index) => {
					return (
						<div key={index} className="text-center">
							<tech.icon className="h-20 w-20" />
							<h2>{tech.name}</h2>
						</div>
					);
				})}
			</div>
		</div>
	);
}

const tech_used = [
	{ name: "Vite", icon: SiVite },
	{ name: "React", icon: SiReact },
	{ name: "Expo", icon: SiExpo },
	{ name: "Node", icon: SiNodedotjs },
	{ name: "TypeScript", icon: SiTypescript },
	{ name: "NestJS", icon: SiNestjs },
	{ name: "Tailwind", icon: SiTailwindcss },
	{ name: "Express", icon: SiExpress },
	{ name: "Fastify", icon: SiFastify },
	{ name: "GraphQL", icon: SiGraphql },
	{ name: "Apollo", icon: SiApollographql },
	{ name: "React Query", icon: SiReactquery },
	{ name: "Deno", icon: SiDeno },
	{ name: "SQLite", icon: SiSqlite },
	{ name: "PostgreSQL", icon: SiPostgresql },
	{ name: "MongoDB", icon: SiMongodb },
	{ name: "Firebase", icon: SiFirebase },
	{ name: "Supabase", icon: SiSupabase },
	{ name: "Pocketbase", icon: SiPocketbase },
];
