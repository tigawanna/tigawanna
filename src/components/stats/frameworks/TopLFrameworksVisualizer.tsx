"use client";

import { Pack, hierarchy } from "@visx/hierarchy";
import { ParentSize } from "@visx/responsive";
import React from "react";
import { twMerge } from "tailwind-merge";

type FW = { name: string; img: string; percentage: number };
interface TopFrameworksVisualizerProps {
	pkgs: FW[];
}

interface Circle {
	data: FW;
	depth: number;
	height: number;
	width: number;
	r: number;
	value: number;
	x: number;
	y: number;
}
export function TopFrameworksVisualizer({
	pkgs,
}: TopFrameworksVisualizerProps) {
	const pack = React.useMemo(
		() => ({
			children: pkgs,
			name: "root",
			radius: 0,
			distance: 0,
		}),
		[pkgs],
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
		<div className="w-full md:w-[70%] h-full flex flex-col items-center gap-2 pt-2">
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
								<Pack root={root} size={[width, width]} padding={width * 0.005}>
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

													return (
														<div
															key={`circle-${i}`}
															className={
																`spon-link ` +
																`absolute shadow-lg bg-white rounded-xl z-0`
															}
															style={{
																left: circle.x,
																top: circle.y,
																width: circle.r * 2,
																height: circle.r * 2,
															}}
														>
															<img
																key={`circle-${i}`}
																className={`absolute bg-no-repeat bg-center bg-contain rounded-xl
                                    w-[95%] h-[95%] dark:w-[100.5%] dark:h-[100.5%] object-cover
                                    left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                    `}
																src={circle.data.img}
															/>
															<div
																className="absolute bottom-[1%] left-[10%] p-2 font-bold  
                                z-50 rounded-xl text-sm
                                bg-base-300 text-base-content"
															>
																{circle.data.name} {circle.data.percentage}%
															</div>
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
	);
}
