import { ContactLinks } from "../shared/ContactLinks";
interface AboutLinksProps {}
export function AboutLinks({}: AboutLinksProps) {
  return (
    <div className="w-full flex justify-end  p-3 sticky top-7 md:top-3  left=10 z-50 bg-opacity-30">
      <ContactLinks />
    </div>
  );
}
