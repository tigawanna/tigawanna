import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { OrganicDivider } from "./LandingPrimitives";

type EditorialTone = "olive" | "sage";

const toneClasses = {
  olive: "bg-[#687054] text-[#e8e4d5]",
  sage: "bg-[#8f9980] text-[#eef0e6]",
} satisfies Record<EditorialTone, string>;

type EditorialMobileSectionProps = {
  title: string;
  tone: EditorialTone;
  showDivider?: boolean;
  children: ReactNode;
  className?: string;
  dataTest?: string;
};

export function EditorialMobileSection({
  title,
  tone,
  showDivider = false,
  children,
  className,
  dataTest,
}: EditorialMobileSectionProps) {
  return (
    <article
      data-test={dataTest}
      className={twMerge(
        "relative px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-32",
        toneClasses[tone],
        className,
      )}
    >
      {showDivider ? <OrganicDivider tone={tone} /> : null}

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <h3 className="mb-10 text-center font-serif text-4xl leading-[0.95] font-medium tracking-[-0.04em] sm:mb-12 sm:text-5xl lg:mb-14 lg:text-6xl">
          {title}
        </h3>

        {children}
      </div>
    </article>
  );
}
