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
import { TechIcons } from "../../icons/tech";

type TechUsedProps = {};



export function TechUsed({}: TechUsedProps) {
  return (
    <div className="w-full h-full  flex flex-col items-center justify-center lg:px-[10%] px-2">
      <SectionHeader heading="Technologies" id="tech" />
      <div className="w-full h-fit flex flex-wrap items-center justify-center gap-5">
        {TechIcons.map((tech, index) => {
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
