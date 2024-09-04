import { ContactLinks } from "./ContactLinks";

type footerProps = {};

export function MainFooter({}: footerProps) {
  return (
    <footer
      className="w-full flex flex-wrap  items-center justify-center border-t
     border-t-green-500 p-5 bg-green-800 bg-opacity-25 gap-4"
    >
      <div className=" text-slate-300 font-bold text-xl">Contact me</div>
      <ContactLinks size={20} />
    </footer>
  );
}
