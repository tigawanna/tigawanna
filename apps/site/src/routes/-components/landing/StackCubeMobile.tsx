import { stackCubeFaces } from "@/config/info";
import { animate, onScroll, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { CubeVisual } from "./CubeVisual";

function StackCubeFaceCard({ label, techs }: { label: string; techs: readonly string[] }) {
  return (
    <article
      data-test={`stack-cube-face-${label.toLowerCase()}`}
      className="rounded-2xl border border-[#c5ccb4]/12 bg-[#1f2119]/80 p-5"
    >
      <p className="text-[10px] tracking-[0.32em] text-[#c5ccb4]/40 uppercase">I build for</p>
      <h3 className="mt-2 font-serif text-2xl font-medium tracking-[-0.03em]">{label}</h3>
      <ul className="mt-4 flex flex-wrap gap-2">
        {techs.map((tech) => (
          <li
            key={tech}
            className="rounded-full border border-[#c5ccb4]/12 bg-[#c5ccb4]/5 px-3 py-1 text-xs tracking-wide text-[#c5ccb4]/72"
          >
            {tech}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function StackCubeMobile() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const items = list.querySelectorAll<HTMLElement>("[data-stack-face]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "none";
      });
      return;
    }

    const anim = animate(items, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 700,
      delay: stagger(80, { start: 100 }),
      ease: "outQuart",
      autoplay: onScroll({
        target: list,
        enter: "top 88%",
        leave: "top",
        sync: false,
        repeat: false,
      }),
    });

    const frame = requestAnimationFrame(() => {
      const rect = list.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        anim.revert();
        animate(items, {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 700,
          delay: stagger(80, { start: 100 }),
          ease: "outQuart",
        });
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      anim.revert();
    };
  }, []);

  return (
    <div
      data-test="stack-cube-mobile"
      className="relative bg-[#1a1a15] px-6 py-16 text-[#c5ccb4] sm:px-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(104,112,84,0.1),transparent_50%)]" />

      <div className="relative z-10 mx-auto w-full max-w-lg">
        <p className="text-center text-xs tracking-[0.38em] text-[#c5ccb4]/40 uppercase">
          What I build with
        </p>

        <div className="mt-8 flex justify-center">
          <div className="cube-stage cube-stage--compact">
            <CubeVisual />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          {stackCubeFaces.map((face, index) => (
            <div key={face.label} className="flex items-center gap-2">
              {index > 0 && <div className="h-px w-3 bg-[#c5ccb4]/30" />}
              <span className="text-[9px] tracking-[0.25em] text-[#c5ccb4]/35 uppercase">
                {face.label}
              </span>
            </div>
          ))}
        </div>

        <div ref={listRef} className="mt-10 flex flex-col gap-4">
          {stackCubeFaces.map((face) => (
            <div key={face.label} data-stack-face className="opacity-0">
              <StackCubeFaceCard label={face.label} techs={face.techs} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
