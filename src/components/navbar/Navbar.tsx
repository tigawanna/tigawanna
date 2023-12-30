import { AboutLinks } from "../about/AboutLinks";

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
  <nav className="w-screen h-10 flex items-center justify-center z-50 sticky top-0 gap-10 glass ">
    <div className="flex items-center justify-center gap-10 px-3">
      {links.map((link) => (
        <a key={link.name} href={link.href} className="hover:text-secondary w-fit">
          {link.name}
        </a>
      ))}
    </div>
    <AboutLinks />
  </nav>
);
}
