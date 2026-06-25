import { stackCubeFaces } from "@/config/info";
import { useStackFacesReveal } from "@/hooks/use-stack-faces-reveal";
import { Bot, Code2, Server, Smartphone, type LucideIcon } from "lucide-react";
import { useRef } from "react";
import { CubeVisual } from "./CubeVisual";

const FACE_META = [
  { background: "#1b2215", foreground: "#d6d0b7", Icon: Code2 },
  { background: "#404b38", foreground: "#d6d0b7", Icon: Smartphone },
  { background: "#2b3422", foreground: "#d6d0b7", Icon: Bot },
  { background: "#4a5543", foreground: "#d6d0b7", Icon: Server },
] as const;

type FaceMeta = {
  background: string;
  foreground: string;
  Icon: LucideIcon;
};

export function StackCubeMobile() {
  const listRef = useRef<HTMLDivElement>(null);
  useStackFacesReveal(listRef);

  return (
    <div data-test="stack-cube-mobile">
      <div className="relative bg-[#1a1a15] px-6 py-14 text-[#c5ccb4] sm:px-8 sm:py-18">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(104,112,84,0.1),transparent_50%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center">
          <p className="font-serif text-3xl font-medium tracking-[-0.03em] text-[#c5ccb4]/90 sm:text-4xl">
            What I build with
          </p>

          <div className="mt-8 flex justify-center">
            <div className="cube-stage cube-stage--compact">
              <CubeVisual />
            </div>
          </div>

          <p className="mt-4 text-[10px] tracking-[0.3em] text-[#c5ccb4]/25 uppercase">
            Scroll to explore
          </p>
        </div>
      </div>

      <div ref={listRef}>
        {stackCubeFaces.map((face, index) => {
          const style: FaceMeta = FACE_META[index];
          const isFirst = index === 0;
          const Icon = style.Icon;

          return (
            <div
              key={face.label}
              data-face-panel
              data-test={`stack-face-${face.label.toLowerCase()}`}
              className="sticky top-0 flex h-svh w-full flex-col items-center justify-center overflow-hidden px-8"
              style={{
                backgroundColor: style.background,
                color: style.foreground,
                clipPath: isFirst ? undefined : "circle(7% at 50% 50%)",
              }}
            >
              <div
                data-face-content
                className="relative flex w-full max-w-sm flex-col items-center gap-6"
                style={isFirst ? undefined : { opacity: 0 }}
              >
                <h3 className="font-serif text-[22vw] leading-none font-medium tracking-[-0.04em] sm:text-[16vw]">
                  {face.label}
                </h3>

                <div
                  className="h-px w-10 opacity-30"
                  style={{ backgroundColor: style.foreground }}
                />

                <p className="text-center text-sm leading-7 opacity-55 sm:text-base sm:leading-8">
                  {face.techs.join("  ·  ")}
                </p>

                <Icon
                  className="pointer-events-none absolute right-[-10vw] top-[-12vw] size-[42vw] select-none sm:size-[32vw]"
                  style={{ opacity: 0.05 }}
                  aria-hidden="true"
                  strokeWidth={1.15}
                />
              </div>
            </div>
          );
        })}
        <div aria-hidden="true" className="h-svh" data-face-scroll-hold />
      </div>
    </div>
  );
}
