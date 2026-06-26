import { createTimeline, onScroll, stagger } from "animejs";
import { useEffect, type RefObject } from "react";

const LG_QUERY = "(min-width: 1024px)";

export function useTechChoicesScroll(ref: RefObject<HTMLElement | null>, itemCount: number) {
  useEffect(() => {
    const sectionEl = ref.current;
    if (!sectionEl || itemCount < 1) return;

    const lg = window.matchMedia(LG_QUERY);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timeline: ReturnType<typeof createTimeline> | null = null;

    function buildTimeline(section: HTMLElement) {
      if (!lg.matches) {
        timeline?.revert();
        timeline = null;
        return;
      }

      timeline?.revert();

      const step = 90;

      timeline = createTimeline({
        autoplay: onScroll({
          target: section,
          enter: "top",
          leave: "bottom",
          sync: true,
        }),
      });

      const detailGroups = section.querySelectorAll("[data-tech-detail-group]");
      const toolGroups = section.querySelectorAll("[data-tech-tool-group]");

      detailGroups.forEach((group, index) => {
        const enterAt = index * step;
        const exitAt = (index + 1) * step - 14;
        const isLast = index === itemCount - 1;

        timeline!.add(
          group,
          { opacity: [0, 1], translateX: [-28, 0], duration: 80, ease: "outQuart" },
          enterAt,
        );

        if (!isLast) {
          timeline!.add(
            group,
            { opacity: [1, 0], translateX: [0, -18], duration: 70, ease: "inQuart" },
            exitAt,
          );
        }

        const detailLines = group.querySelectorAll("[data-tech-detail-line]");
        timeline!.add(
          detailLines,
          {
            opacity: [0, 1],
            translateY: [14, 0],
            duration: 60,
            delay: stagger(18),
            ease: "outQuart",
          },
          enterAt + 8,
        );

        if (!isLast) {
          timeline!.add(
            detailLines,
            {
              opacity: [1, 0],
              translateY: [0, -8],
              duration: 45,
              delay: stagger(12),
              ease: "inQuart",
            },
            exitAt + 4,
          );
        }
      });

      toolGroups.forEach((group, index) => {
        const enterAt = index * step + 6;
        const exitAt = (index + 1) * step - 14;
        const isLast = index === itemCount - 1;
        const toolRow = group.querySelector("[data-tech-tool-row]");

        timeline!.add(group, { opacity: [0.4, 1], duration: 70, ease: "outQuart" }, enterAt);

        if (!isLast) {
          timeline!.add(group, { opacity: [1, 0.4], duration: 60, ease: "inQuart" }, exitAt);
        }

        if (toolRow) {
          timeline!.add(
            toolRow,
            { translateX: [0, -68], scale: [1, 1.02], duration: 80, ease: "outQuart" },
            enterAt,
          );

          if (!isLast) {
            timeline!.add(
              toolRow,
              { translateX: [-68, 0], scale: [1.02, 1], duration: 65, ease: "inQuart" },
              exitAt,
            );
          }
        }
      });
    }

    buildTimeline(sectionEl);

    const onBreakpointChange = () => buildTimeline(sectionEl);
    lg.addEventListener("change", onBreakpointChange);

    return () => {
      lg.removeEventListener("change", onBreakpointChange);
      timeline?.revert();
    };
  }, [ref, itemCount]);
}
