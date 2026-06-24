import { LandingPeripheralProse } from "./LandingPeripheralProse";

export function LandingPeripheralCards() {
  return (
    <section id="about" data-test="peripheral-cards" aria-labelledby="how-i-work-heading">
      <h2 id="how-i-work-heading" className="sr-only">
        How I work
      </h2>

      <LandingPeripheralProse />
    </section>
  );
}
