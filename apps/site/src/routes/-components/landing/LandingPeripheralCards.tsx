import { LandingPeripheralCardsDesktop } from "./LandingPeripheralCardsDesktop";
import { LandingPeripheralCardsMobile } from "./LandingPeripheralCardsMobile";

export function LandingPeripheralCards() {
  return (
    <section id="about" data-test="peripheral-cards" aria-labelledby="how-i-work-heading">
      <h2 id="how-i-work-heading" className="sr-only">
        How I work
      </h2>

      <div className="lg:hidden">
        <LandingPeripheralCardsMobile />
      </div>

      <div className="hidden lg:block">
        <LandingPeripheralCardsDesktop />
      </div>
    </section>
  );
}
