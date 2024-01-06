import { ContactLinks } from "../shared/ContactLinks";
interface AboutLinksProps {}
export function AboutLinks({}: AboutLinksProps) {
  return (
    <div
      className="w-fit justify-end hidden md:flex md:top-10 sticky lg:top-2 z-50  right-10  bg-opacity-30">
      <ContactLinks />
    </div>
  );
}
