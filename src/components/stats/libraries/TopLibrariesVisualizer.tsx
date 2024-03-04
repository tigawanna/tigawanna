"use client";

import React from "react";
import { ViewerLibraries } from "./helpers/api";
import { Pack, hierarchy } from "@visx/hierarchy";
import { ParentSize } from "@visx/responsive";
import { twMerge } from "tailwind-merge";

interface TopLibrariesVisualizerProps {
  libs: ViewerLibraries | undefined;
}

interface Circle {
  data: { key: string; value: number };
  depth: number;
  height: number;
  width: number;
  r: number;
  value: number;
  x: number;
  y: number;
}
export function TopLibrariesVisualizer({ libs }: TopLibrariesVisualizerProps) {
  const languages = Object.entries(libs?.library_stats ?? {}).map(([key, value]) => ({
    key,
    value,
  }));

  const pack = React.useMemo(
    () => ({
      children: languages,
      name: "root",
      radius: 0,
      distance: 0,
    }),
    [languages]
  );

  const root = React.useMemo(
    () =>
      hierarchy(pack)
        // d:{key:string;value:number}
        .sum((d: any) => {
          // // no("sum", d?.tier?.monthlyPriceInDollars)
          return 1 + d?.value;
        })
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0)),
    [pack]
  );

  return (
    <div className="w-full h-full flex flex-col items-center gap-2 pt-2 lg:px-[2%]">
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
                    // // no(" ===== PACK DATA ======= ", packData);
                    const circles = packData.descendants().slice(1); // skip first layer
                    // // no("========= CIRCLES DESCENDANT ======== ", circles);
                    return (
                      <div>
                        {[...circles].reverse().map((circ, i) => {
                          const circle = circ as any as Circle;
                          const tooltipX = circle.x > width / 2 ? "left" : "right";
                          const tooltipY = circle.y > width / 2 ? "top" : "bottom";

                          return (
                            <a
                              key={`circle-${i}`}
                              href={`https://github.com/${circle.data.key}`}
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
                                loading="lazy"
                                className={`absolute bg-no-repeat bg-center bg-contain rounded-full
                                    w-[95%] h-[95%] dark:w-[100.5%] dark:h-[100.5%]
                                    left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                    `}
                                src={`https://avatars0.githubusercontent.com/${
                                  circle.data.key
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
                                <p className={`whitespace-nowrap font-bold`}>{circle.data.key}</p>
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
      <div role="alert" className="alert bg-opacity-30 rounded-xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-info shrink-0 w-6 h-6">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Images above might be inaccurate as the repository names might not match the npm package name</span>
      </div>
    </div>
  );
}
