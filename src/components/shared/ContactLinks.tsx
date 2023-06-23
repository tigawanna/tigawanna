"use client"
import Link from "next/link";
import { IconContext } from "react-icons";
import { FaGithub, FaLinkedinIn, FaDev, FaTwitter } from "react-icons/fa";

interface ContactLinksProps {
size?:number;
}

export function ContactLinks({size=30}:ContactLinksProps){
return (
    <IconContext.Provider value={{ size:`${size}px` }}>
        <div className='p-1  flex text-green-400 gap-2'>
            <Link href="https://github.com/tigawanna" target="_blank" ><FaGithub /></Link>
            <Link href="https://linkedin.com/in/dennis-kinuthia" target="_blank" > <FaLinkedinIn /></Link>
            <Link href="https://dev.to/tigawanna" target="_blank"><FaDev /></Link>
            <Link href="https://twitter.com/tigawanna" target="_blank"><FaTwitter /></Link>
        </div>
    </IconContext.Provider>
);
}
