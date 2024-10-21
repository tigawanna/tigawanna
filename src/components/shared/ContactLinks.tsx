import Link from "next/link";
import { FaDev, FaGithub, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { siteConfig } from "./container/site";
interface ContactLinksProps {
  size?: number;
}

export function ContactLinks({ size = 30 }: ContactLinksProps) {
  return (
    <div className="p-1  flex gap-3 glass rounded-lg px-2 z-50">
      <Link
        href={siteConfig.links.github}
        target="_blank"
        rel="noopener noreferrer"
        title={siteConfig.links.nickname}
      >
        <FaGithub className="w-7 h-7 hover:text-secondary" />
      </Link>
      <Link
        href={siteConfig.links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        title={"dennis-kinuthia"}
      >
        {" "}
        <FaLinkedinIn className="w-7 h-7 hover:text-secondary" />
      </Link>
      <Link
        href={siteConfig.links.devto}
        target="_blank"
        rel="noopener noreferrer"
        title={siteConfig.links.nickname}
      >
        <FaDev className="w-7 h-7 hover:text-secondary" />
      </Link>
      {/* <Link
				href={siteConfig.links.twitter}
				target="_blank"
				rel="noopener noreferrer"
				title={siteConfig.links.nickname}
			>
				<FaTwitter className="w-7 h-7 hover:text-secondary" />
			</Link> */}
      <Link
        href={siteConfig.links.email}
        target="_blank"
        rel="noopener noreferrer"
        title={siteConfig.links.email}
      >
        <HiOutlineMail className="w-7 h-7 hover:text-secondary" />
      </Link>
      <Link
        href={siteConfig.links.phone}
        target="_blank"
        rel="noopener noreferrer"
        title={siteConfig.links.phone}
      >
        <FaWhatsapp className="w-7 h-7 hover:text-secondary" />
      </Link>
    </div>
  );
}
