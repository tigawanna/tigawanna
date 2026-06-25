import { createTimeline } from "animejs";
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { CREATURE_CURTAIN_PLEATS } from "@/lib/creature-feature/curtain";

function CurtainCloseOverlay({ onDone }: { onDone: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const left = container.querySelector<HTMLElement>("[data-curtain-left]");
    const right = container.querySelector<HTMLElement>("[data-curtain-right]");
    const flash = container.querySelector<HTMLElement>("[data-curtain-flash]");
    if (!left || !right || !flash) return;

    const timeline = createTimeline({
      onComplete: onDone,
    });

    timeline
      .add(flash, { opacity: [0, 0.65, 0], duration: 600, ease: "outQuad" }, 0)
      .add(left, { translateX: ["-101%", "0%"], duration: 1500, ease: "inOutQuart" }, 220)
      .add(right, { translateX: ["101%", "0%"], duration: 1500, ease: "inOutQuart" }, 220);

    return () => {
      timeline.revert();
    };
  }, [onDone]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#050505]"
      aria-hidden="true"
    >
      <div
        data-curtain-flash
        className="pointer-events-none absolute inset-0 bg-[#ff5b51] opacity-0"
      />
      <div
        data-curtain-left
        className="absolute inset-y-0 left-0 w-[52%]"
        style={{ background: CREATURE_CURTAIN_PLEATS, transform: "translateX(-101%)" }}
      />
      <div
        data-curtain-right
        className="absolute inset-y-0 right-0 w-[52%]"
        style={{ background: CREATURE_CURTAIN_PLEATS, transform: "translateX(101%)" }}
      />
    </div>
  );
}

export function playCreatureCurtainClose(onComplete: () => void) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onComplete();
    return;
  }

  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);

  const cleanup = () => {
    root.unmount();
    host.remove();
  };

  root.render(
    <CurtainCloseOverlay
      onDone={() => {
        cleanup();
        onComplete();
      }}
    />,
  );
}
