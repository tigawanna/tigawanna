import type { ProseSegment } from "@/config/info";

type FlowingProseProps = {
  segments: readonly ProseSegment[];
};

export function FlowingProse({ segments }: FlowingProseProps) {
  return (
    <p
      data-test="flowing-prose"
      className="mx-auto max-w-2xl text-center text-xl leading-[1.65] font-light sm:text-2xl sm:leading-[1.7] lg:max-w-4xl lg:text-3xl lg:leading-[1.6] xl:text-[2rem] xl:leading-[1.55]"
    >
      {segments.map((segment, index) => (
        <span
          key={`${segment.text.slice(0, 24)}-${index}`}
          className={segment.emphasis ? "text-current" : "text-current/30"}
        >
          {segment.text}
        </span>
      ))}
    </p>
  );
}
