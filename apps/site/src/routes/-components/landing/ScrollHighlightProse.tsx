import { createTimeline, onScroll } from "animejs";
import { useEffect, useRef } from "react";

const WORD_START = "#3a4038";
const WORD_END = "#c5ccb4";

type ScrollHighlightProseProps = {
  title: string;
  text: string;
};

export function ScrollHighlightProse({ title, text }: ScrollHighlightProseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const wordEls = section.querySelectorAll<HTMLElement>("[data-scroll-word]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      wordEls.forEach((word) => {
        word.style.color = WORD_END;
      });
      return;
    }

    const timeline = createTimeline({
      autoplay: onScroll({
        target: section,
        enter: "top top",
        leave: "bottom bottom",
        sync: true,
      }),
    });

    const step = words.length > 1 ? 100 / (words.length - 1) : 0;

    wordEls.forEach((word, index) => {
      timeline.add(
        word,
        {
          color: [WORD_START, WORD_END],
          duration: step,
          ease: "linear",
        },
        index * step,
      );
    });

    return () => {
      timeline.revert();
    };
  }, [words.length, text]);

  return (
    <section
      ref={sectionRef}
      data-test="scroll-highlight-prose"
      className="relative bg-[#1a1a15] text-[#c5ccb4]"
      style={{ height: "180vh" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(104,112,84,0.1),transparent_55%)]" />

      <div className="sticky top-0 flex h-screen flex-col items-center justify-center px-6 lg:px-12">
        <h2
          id="how-i-work-heading"
          className="mb-10 font-serif text-3xl font-medium tracking-[-0.03em] text-[#c5ccb4]/55 sm:mb-12 sm:text-4xl lg:text-5xl"
        >
          {title}
        </h2>

        <p className="mx-auto max-w-4xl text-center font-serif text-2xl leading-[1.6] font-light sm:max-w-5xl sm:text-3xl sm:leading-[1.65] lg:text-4xl lg:leading-[1.6] xl:text-5xl xl:leading-[1.55]">
          {words.map((word, index) => (
            <span key={`${word}-${index}`} data-scroll-word style={{ color: WORD_START }}>
              {word}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
