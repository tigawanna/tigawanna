import { AboutLinks } from "../../about/AboutLinks";

interface NavbarProps {

}

export function Navbar({}:NavbarProps){
const links =[
    {
        name: "Home",
        href: "#",
    },
    {
        name: "About",
        href: "#about",
    },
    {
        name: "Ibuild",
        href: "#ibuild",
    },
    {
        name: "Projects",
        href: "#projects",
    },
    {
        name: "Contact",
        href: "#contact",
    },
]
return (
  <nav className="w-screen h-10 flex items-center justify-evenly z-50 sticky top-0 gap-10 s ">
    <div className="w-fit flex items-center justify-center gap-10 px-3 ">
      {links.map((link) => (
        <a key={link.name} href={link.href} className="hover:text-secondary w-fit">
          {link.name}
        </a>
      ))}
    </div>
    <div className="hidden md:flex">
    <AboutLinks />
    </div>
  </nav>
);
}
