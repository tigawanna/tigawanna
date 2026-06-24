import { LandingPeripheralProse } from "./LandingPeripheralProse";

export function LandingPeripheralCards() {
  return (
    <section id="about" data-test="peripheral-cards" aria-labelledby="how-i-work-heading">
      <LandingPeripheralProse />
    </section>
  );
}
