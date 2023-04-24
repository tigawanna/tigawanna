import { Link } from "rakkasjs";
import { IconContext } from "react-icons";
import { FaGithub, FaLinkedinIn, FaDev } from "react-icons/fa/index.js";

interface AboutLinksProps {

}

export function AboutLinks({}:AboutLinksProps){
return (
    <div className="w-full flex justify-end  p-3 sticky top-0 z-50 bg-opacity-30">
 
        <IconContext.Provider value={{ size: "40", className: "mx-2" }}>
        <div className='p-1  flex text-green-400 gap-2'>
        <Link href="https://github.com/tigawanna"target="_blank" ><FaGithub /></Link>
        <Link href="https://linkedin.com/in/dennis-kinuthia"target="_blank" > <FaLinkedinIn/></Link>
        <Link href="https://dev.to/tigawanna" target="_blank"><FaDev /></Link>
        </div>
        </IconContext.Provider>
    </div>
);
}

