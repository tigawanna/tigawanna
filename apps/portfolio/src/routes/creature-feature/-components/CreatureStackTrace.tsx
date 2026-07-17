import { useStackTraceFlood } from "@/hooks/use-stack-trace-flood";
import { getStackTraceLines } from "@/modules/creature-feature/stack-trace";
import type { StackTraceTone } from "@/types/creature-feature";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { CreatureFeatureTitle } from "./CreatureFeatureTitle";

const TONE_CLASS: Record<StackTraceTone, string> = {
  base: "text-red-300/65",
  hot: "text-red-500",
  dim: "text-red-200/30",
};

interface CreatureStackTraceProps {
  onComplete: () => void;
}

export function CreatureStackTrace({ onComplete }: CreatureStackTraceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const [lines] = useState(getStackTraceLines);

  useStackTraceFlood(streamRef, sectionRef, { onComplete });
  useHotkeys(
    ["right", "down", "space", "enter"],
    (event) => {
      if (event.repeat) return;
      onComplete();
    },
    { preventDefault: true },
    [onComplete],
  );

  return (
    <section
      ref={sectionRef}
      data-test="creature-stack-trace"
      className="relative h-[260vh] bg-[#050505]"
    >
      <div className="sticky top-0 flex h-svh items-end overflow-hidden mask-[linear-gradient(to_bottom,transparent,#000_14%,#000_80%,transparent)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,40,30,0.12),transparent_60%)]"
          aria-hidden="true"
        />

        <div ref={streamRef} className="absolute inset-x-0 top-0 will-change-transform">
          <div className="flex h-svh items-center justify-center px-8">
            <CreatureFeatureTitle />
          </div>

          <div className="mx-auto max-w-4xl px-6 pb-[40vh] font-mono text-[11px] leading-6 md:text-sm md:leading-7">
            {lines.map((line) => (
              <p
                key={line.id}
                style={{ marginLeft: `${line.indent}ch`, opacity: line.opacity }}
                className="whitespace-pre-wrap wrap-break-word"
              >
                {line.segments.map((segment, index) => (
                  <span key={index} className={TONE_CLASS[segment.tone]}>
                    {segment.text}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="pointer-events-none sticky bottom-8 z-20 flex justify-center">
        <span className="animate-pulse font-mono text-[10px] tracking-[0.3em] text-red-200/40 uppercase">
          the creature is unraveling…
        </span>
      </div>
    </section>
  );
}
