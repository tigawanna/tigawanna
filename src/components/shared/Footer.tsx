import { ContactLinks } from "./ContactLinks";
import { CopyAllLinksButton } from "./CopyAlLinks";
import { FooterContacts } from "./FooterContacts";

type footerProps = {};

export function MainFooter({}: footerProps) {
  return (
    <footer
      className="
        w-full flex flex-wrap items-center justify-center 
        border-t border-t-secondary bg-opacity-25 gap-4 p-4
        animate-in fade-in-50 slide-in-from-bottom-4 duration-700
        @starting-style:opacity-0 @starting-style:translate-y-4
      "
    >
      <FooterContacts/>
      <CopyAllLinksButton 
        showTitle 
        className="
          my-4 transition-all duration-300 
          hover:scale-105 hover:shadow-md
        " 
        title="Copy all contact links"
      />
    </footer>
  );
}
