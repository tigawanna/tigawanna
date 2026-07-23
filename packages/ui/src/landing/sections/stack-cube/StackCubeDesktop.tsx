import { stackCubeFaces } from "../../config/info";
import { createTimeline, onScroll, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { CubeVisual } from "./CubeVisual";

const LG_QUERY = "(min-width: 1024px)";

export function StackCubeDesktop() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const cubeEl = cubeRef.current;
    if (!sectionEl || !cubeEl) return;

    const lg = window.matchMedia(LG_QUERY);
    if (!lg.matches) return;

    let timeline: ReturnType<typeof createTimeline> | null = null;

    function buildTimeline(section: HTMLDivElement, cube: HTMLDivElement) {
      if (!lg.matches) {
        timeline?.revert();
        timeline = null;
        return;
      }

      timeline?.revert();

      timeline = createTimeline({
        autoplay: onScroll({
          target: section,
          enter: "top",
          leave: "bottom",
          sync: true,
        }),
      });

      timeline
        .add(cube, {
          rotateY: ["-20deg", "70deg"],
          rotateX: ["-12deg", "-12deg"],
          duration: 250,
        })
        .add(cube, { rotateY: ["70deg", "160deg"], duration: 250 })
        .add(cube, { rotateY: ["160deg", "250deg"], duration: 250 })
        .add(cube, { rotateY: ["250deg", "340deg"], duration: 250 });

      const labelGroups = section.querySelectorAll("[data-label-group]");
      const techGroups = section.querySelectorAll("[data-tech-group]");

      labelGroups.forEach((group, index) => {
        const entryOffset = index * 250 + 20;
        const exitOffset = (index + 1) * 250 - 30;

        timeline!.add(
          group,
          { opacity: [0, 1], translateY: [30, 0], duration: 100, ease: "outQuart" },
          entryOffset,
        );
        timeline!.add(
          group,
          { opacity: [1, 0], translateY: [0, -30], duration: 80, ease: "inQuart" },
          exitOffset,
        );
      });

      techGroups.forEach((group, index) => {
        const techEls = group.querySelectorAll("[data-tech]");
        const entryOffset = index * 250 + 30;
        const exitOffset = (index + 1) * 250 - 30;

        timeline!.add(group, { opacity: [0, 1], duration: 60, ease: "outQuart" }, entryOffset);
        timeline!.add(group, { opacity: [1, 0], duration: 50, ease: "inQuart" }, exitOffset);

        timeline!.add(
          techEls,
          {
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 70,
            delay: stagger(35),
            ease: "outQuart",
          },
          entryOffset + 20,
        );
        timeline!.add(
          techEls,
          {
            opacity: [1, 0],
            translateX: [0, 20],
            duration: 50,
            delay: stagger(20),
            ease: "inQuart",
          },
          exitOffset - 10,
        );
      });
    }

    buildTimeline(sectionEl, cubeEl);

    const onBreakpointChange = () => buildTimeline(sectionEl, cubeEl);
    lg.addEventListener("change", onBreakpointChange);

    return () => {
      lg.removeEventListener("change", onBreakpointChange);
      timeline?.revert();
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      data-test="stack-cube-desktop"
      className="landing-void-surface relative"
      style={{ height: "400vh" }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div className="landing-void-glow-center pointer-events-none absolute inset-0" />

        <div className="relative z-10 grid w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-28 px-6 xl:gap-36">
          <div className="relative min-h-[280px]">
            {stackCubeFaces.map((face, index) => (
              <div
                key={face.label}
                data-label-group
                className="absolute inset-0 flex flex-col justify-center"
                style={{ opacity: index === 0 ? 1 : 0 }}
              >
                <p className="text-xs tracking-[0.38em] text-landing-sage/40 uppercase">
                  I build for
                </p>
                <h3 className="mt-3 font-serif text-6xl font-medium tracking-[-0.03em] lg:text-7xl">
                  {face.label}
                </h3>
                <div className="mt-4 h-px w-16 bg-landing-sage/20" />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center px-10 lg:px-14">
            <div className="cube-stage cube-stage--centered">
              <CubeVisual cubeRef={cubeRef} />
            </div>
          </div>

          <div className="relative min-h-[280px] pl-8 lg:pl-16 xl:pl-24">
            {stackCubeFaces.map((face, index) => (
              <div
                key={face.label}
                data-tech-group
                className="absolute inset-0 flex flex-col justify-center gap-2.5"
                style={{
                  opacity: index === 0 ? 1 : 0,
                  pointerEvents: index === 0 ? "auto" : "none",
                }}
              >
                {face.techs.map((tech) => (
                  <span
                    key={tech}
                    data-tech
                    className="block text-base leading-snug tracking-wide text-landing-sage/70 lg:text-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute right-0 bottom-10 left-0 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-landing-sage/30" aria-hidden="true">
            {stackCubeFaces.map((face, index) => (
              <div key={face.label} className="flex items-center gap-2">
                {index > 0 && <div className="h-px w-3 bg-current" />}
                <span className="text-[9px] tracking-[0.25em] uppercase">{face.label}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] tracking-[0.3em] text-landing-sage/25 uppercase">
            Scroll to rotate
          </p>
        </div>
      </div>
    </div>
  );
}
