import { ContactLinks } from "./ContactLinks";
import { CopyAllLinksButton } from "./CopyAlLinks";
import { FooterContacts } from "./FooterContacts";

type footerProps = {};

export function MainFooter({}: footerProps) {
  return (
    <footer
      className="w-full flex flex-wrap  items-center justify-center border-t
     border-t-secondary  bg-opacity-25 gap-4 p-4"
    >
      {/* <div className=" text-slate-300 font-bold text-xl">Contact me</div> */}
      {/* <ContactLinks size={20} showText/> */}
      <FooterContacts/>
      <CopyAllLinksButton showTitle className="my-4" title="Copy all contact links"/>
    </footer>
  );
}
