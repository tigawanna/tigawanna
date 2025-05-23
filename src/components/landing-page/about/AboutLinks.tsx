import { ContactLinks } from "../../shared/ContactLinks";
type AboutLinksProps = {};
export function AboutLinks({}: AboutLinksProps) {
  return (
    <div className="w-fit justify-end hidden md:flex md:top-10 sticky lg:top-10 z-50  right-5  bg-opacity-30">
      <ContactLinks navbar/>
    </div>
  );
}
