import Link from "next/link";
import { FaDev, FaGithub, FaLinkedinIn, FaPhone, FaWhatsapp } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { siteConfig } from "./container/site";

interface ContactLinksProps {
  navbar?: boolean;
  footer?: boolean;
  size?: number;
  showText?: boolean;
}

export function ContactLinks({ size = 30, navbar, showText }: ContactLinksProps) {
  return (
    <div 
      data-navbar={navbar}
      className="p-1 flex gap-3 glass md:data-[navbar=true]:flex-col rounded-lg px-2 z-50"
    >
      <Link
        href={siteConfig.links.github}
        target="_blank"
        rel="noopener noreferrer"
        title={siteConfig.links.nickname}
        className="flex items-center gap-2 hover:text-secondary"
      >
        <FaGithub className="w-7 h-7" />
        {showText && <span>GitHub</span>}
      </Link>
      
      <Link
        href={siteConfig.links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        title={"dennis-kinuthia"}
        className="flex items-center gap-2 hover:text-secondary"
      >
        <FaLinkedinIn className="w-7 h-7" />
        {showText && <span>LinkedIn</span>}
      </Link>
      
      <Link
        href={siteConfig.links.devto}
        target="_blank"
        rel="noopener noreferrer"
        title={siteConfig.links.nickname}
        className="flex items-center gap-2 hover:text-secondary"
      >
        <FaDev className="w-7 h-7" />
        {showText && <span>Dev.to</span>}
      </Link>
      
      <Link
        href={siteConfig.links.email}
        target="_blank"
        rel="noopener noreferrer"
        title="Email me"
        className="flex items-center gap-2 hover:text-secondary"
      >
        <HiOutlineMail className="w-7 h-7" />
        {showText && <span>Email</span>}
      </Link>
      
      <Link
        href={siteConfig.links.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp me"
        className="flex items-center gap-2 hover:text-secondary"
      >
        <FaWhatsapp className="w-7 h-7" />
        {showText && <span>WhatsApp</span>}
      </Link>
      
      <Link
        href={siteConfig.links.phoneDialer}
        target="_blank"
        rel="noopener noreferrer"
        title="Call me"
        className="flex items-center gap-2 hover:text-secondary"
      >
        <FaPhone className="w-7 h-7" />
        {showText && <span>Call</span>}
      </Link>
    </div>
  );
}
