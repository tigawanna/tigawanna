"use client";
import { SiSolid } from "react-icons/si";
import { FaReact } from "react-icons/fa";
import { SiSvelte } from "react-icons/si";
import { FaVuejs } from "react-icons/fa";
import { SiDeno } from "react-icons/si";
import { SiRemix } from "react-icons/si";
import { TbBrandNextjs } from "react-icons/tb";
import { SiNuxtdotjs } from "react-icons/si";

import { Pack, hierarchy } from "@visx/hierarchy";
import { ParentSize } from "@visx/responsive";
import { twMerge } from "tailwind-merge";
import React from "react";
interface LibraryIconsProps {}

const frameworks = [
  { name: "SolidJS", value: 3 },
  { name: "ReactJS", value: 10 },
  { name: "sveltejs", value: 4 },
  { name: "VueJS", value: 7 },
  { name: "denoland", value: 3 },
  { name: "remix-run", value: 2 },
  { name: "vercel", value: 7 },
  { name: "Nuxt", value: 4 },
  { name: "oven-sh", value: 1 },
  { name: "BuilderIO", value: 1 },
  { name: "withastro", value: 3 },
  { name: "nodejs", value: 10 },
];
interface Circle {
  data: (typeof frameworks)[number];
  depth: number;
  height: number;
  width: number;
  r: number;
  value: number;
  x: number;
  y: number;
}

export function LibraryIcons({}: LibraryIconsProps) {
  const pack = React.useMemo(
    () => ({
      children: frameworks,
      name: "root",
      radius: 0,
      distance: 0,
    }),
    [frameworks]
  );

  const root = React.useMemo(
    () =>
      hierarchy(pack)
        // d:{key:string;value:number}
        .sum((d: any) => {
          console.log("===== d ==== ", d);
          return 1 + d?.value;
        })
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0)),
    [pack]
  );
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full">
        <ParentSize>
          {({ width = 600 }) => {
            return width < 10 ? null : (
              <div
                style={{
                  width,
                  height: width,
                  position: "relative",
                }}>
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
                <Pack root={root} size={[width, width]} padding={width * 0.005}>
                  {(packData) => {
                    console.log(" ===== PACK DATA ======= ", packData);
                    const circles = packData.descendants().slice(1); // skip first layer
                    console.log("========= CIRCLES DESCENDANT ======== ", circles);
                    return (
                      <div>
                        {[...circles].reverse().map((circ, i) => {
                          const circle = circ as any as Circle;
                          const tooltipX = circle.x > width / 2 ? "left" : "right";
                          const tooltipY = circle.y > width / 2 ? "top" : "bottom";

                          return (
                            <a
                              key={`circle-${i}`}
                              href={`https://github.com/${circle.data.name}`}
                              className={
                                `spon-link ` + `absolute shadow-lg bg-white rounded-full z-0`
                              }
                              style={{
                                left: circle.x,
                                top: circle.y,
                                width: circle.r * 2,
                                height: circle.r * 2,
                              }}>
                              <img
                                key={`circle-${i}`}
                                className={`absolute bg-no-repeat bg-center bg-contain rounded-full
                                    w-[95%] h-[95%] dark:w-[100.5%] dark:h-[100.5%]
                                    left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                    `}
                                src={`https://avatars0.githubusercontent.com/${
                                  circle.data.name
                                }?v=3&s=${Math.round(circle.r * 2)}`}
                              />

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
                                    : `bottom-1/4 translate-y-full`
                                )}>
                                <p className={`whitespace-nowrap font-bold`}>{circle.data.name}</p>
                              </div>
                            </a>
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
  );
}
