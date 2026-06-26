import { techChoices } from "@/config/info";
import { ScrollReveal, SectionEyebrow } from "../../primitives";
import { TechChoiceDetailPanel } from "./TechChoicePanels";

export function TechChoicesMobile() {
  return (
    <div data-test="tech-choices-mobile" className="lg:hidden">
      <div className="container relative z-10 py-20">
        <ScrollReveal className="max-w-xl">
          <SectionEyebrow>Why I choose what I choose</SectionEyebrow>
          <h2 className="landing-section-heading">Ten tools, one reasoned stack at a time.</h2>
          <p className="mt-6 text-base leading-8 text-landing-cream/76">
            The same stack choices, laid out for easy reading on smaller screens.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-4">
          {techChoices.map((choice, index) => (
            <ScrollReveal key={choice.id} delay={index % 2 === 0 ? "short" : "medium"}>
              <TechChoiceDetailPanel
                choice={choice}
                index={index}
                className="rounded-none border border-landing-cream/12 bg-landing-panel/82 p-6 shadow-xl shadow-black/20"
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
