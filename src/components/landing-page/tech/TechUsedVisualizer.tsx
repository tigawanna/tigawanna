"use client";
import {
  SiApollographql,
  SiDeno,
  SiExpress,
  SiFastify,
  SiGraphql,
  SiMongodb,
  SiNestjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiReactquery,
  SiSqlite,
  SiTailwindcss,
  SiTypescript,
  SiVite,
} from "react-icons/si";
import { SectionHeader } from "../shared/SectionHeader";

import { Pack, hierarchy } from "@visx/hierarchy";
import { ParentSize } from "@visx/responsive";
import React from "react";
import { twMerge } from "tailwind-merge";

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

export function TechUsedVisualizer({}: TechUsedProps) {
  const pack = React.useMemo(
    () => ({
      children: tech_used,
      name: "root",
      radius: 0,
      distance: 0,
    }),
    [tech_used],
  );

  const root = React.useMemo(
    () =>
      hierarchy(pack)
        // d:{key:string;value:number}
        .sum((d: any) => {
          // // no("sum", d?.tier?.monthlyPriceInDollars)
          return 1 + d?.percentage;
        })
        // @ts-expect-error
        .sort((a, b) => (b?.percentage ?? 0) - (a?.percentage ?? 0)),
    [pack],
  );
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <SectionHeader heading="I use " id="#tech" />
        {tech_used.map((tech, index) => {
          return (
            <div
              key={index}
              className="h-full flex flex-col items-center justify-center"
            >
              <tech.icon className="h-10 w-10" />
              <h2>{tech.name}</h2>
            </div>
          );
        })}
        <div className="w-full">
          <ParentSize>
            {({ width = 600 }) => {
              return width < 10 ? null : (
                <div
                  style={{
                    width,
                    height: width,
                    position: "relative",
                  }}
                >
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `

              .spon-link {
                transition: all .2s ease;
                transform: translate(-50%, -50%);
              }

              .spon-link:hover {
                z-index: 10;
                transform: translate(-50%, -50%) scale(1.1);
              }

              .spon-link:hover .spon-tooltip {
                opacity: 1;
              }
            `,
                    }}
                  />
                  <Pack
                    root={root}
                    size={[width, width]}
                    padding={width * 0.005}
                  >
                    {(packData) => {
                      // // no(" ===== PACK DATA ======= ", packData);
                      const circles = packData.descendants().slice(1); // skip first layer
                      // // no("========= CIRCLES DESCENDANT ======== ", circles);
                      return (
                        <div>
                          {[...circles].reverse().map((circ, i) => {
                            const circle = circ as any as Circle;
                            const tooltipX =
                              circle.x > width / 2 ? "left" : "right";
                            const tooltipY =
                              circle.y > width / 2 ? "top" : "bottom";
                            console.log("circ === ", circ);
                            return (
                              <div
                                key={`circle-${i}`}
                                // href={`https://github.com/${circle.data.key}`}
                                className={
                                  `spon-link ` +
                                  `absolute shadow-lg bg-white rounded-full z-0`
                                }
                                style={{
                                  left: circle.x,
                                  top: circle.y,
                                  width: circle.r * 2,
                                  height: circle.r * 2,
                                }}
                              >
                                {/* <circle.data.icon
                                // 
                                  className={`absolute bg-no-repeat bg-center bg-contain rounded-full
                                    w-[95%] h-[95%] dark:w-[100.5%] dark:h-[100.5%]
                                    left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                    `}
                                /> */}
                                {/* <img
                                  key={`circle-${i}`}
                                  loading="lazy"
                                  className={`absolute bg-no-repeat bg-center bg-contain rounded-full
                                    w-[95%] h-[95%] dark:w-[100.5%] dark:h-[100.5%]
                                    left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                    `}
                                  src={`https://avatars0.githubusercontent.com/${
                                    circle.data.key
                                  }?v=3&s=${Math.round(circle.r * 2)}`}
                                /> */}
                                <div
                                  className={twMerge(
                                    `spon-tooltip absolute text-sm
                              bg-gray-800 text-white p-2 pointer-events-none
                              transform opacity-0
                              shadow-xl rounded-lg
                              flex flex-col items-center
                            `,

                                    tooltipX == "left"
                                      ? `left-1/4 -translate-x-full`
                                      : `right-1/4 translate-x-full`,
                                    tooltipY == "top"
                                      ? `top-1/4 -translate-y-full`
                                      : `bottom-1/4 translate-y-full`,
                                  )}
                                >
                                  <p className={`whitespace-nowrap font-bold`}>
                                    {circle.data.name}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }}
                  </Pack>
                </div>
              );
            }}
          </ParentSize>
        </div>
      </div>
    </div>
  );
}

const tech_used = [
  { name: "Vite", icon: SiVite },
  { name: "React", icon: SiReact },
  { name: "Node", icon: SiNodedotjs },
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
];
