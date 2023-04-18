import { Link } from "rakkasjs";
import { IconContext } from "react-icons";
import { FaGithub, FaLinkedinIn, FaDev } from "react-icons/fa";
import GitHubImage from '../res/github.jpg'
interface AboutLinksProps {

}

export function AboutLinks({}:AboutLinksProps){
return (
    <div className="w-full flex justify-between  p-3 sticky top-0 z-50 bg-slate-600 bg-opacity-30">
 
        <IconContext.Provider value={{ size: "30px", className: "mx-2" }}>
            <div className='flex items-center gap-1 md:text-xl text-green-300'>
                <img
                    src={GitHubImage}
                    alt="GitHub"
                    height="50px"
                    width="50px"
                    className='rounded-full w-10 aspect-square' />
                    Dennis Kinuthia
            </div>
        <div className='p-1  flex text-green-400 gap-2'>
        <Link href="https://github.com/tigawanna"target="_blank" ><FaGithub /></Link>
        <Link href="https://linkedin.com/in/dennis-kinuthia"target="_blank" > <FaLinkedinIn/></Link>
        <Link href="https://dev.to/tigawanna" target="_blank"><FaDev /></Link>
        </div>
        </IconContext.Provider>
    </div>
);
}
