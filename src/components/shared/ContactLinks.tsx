import Link from "next/link";
import { FaGithub, FaLinkedinIn, FaDev, FaTwitter } from "react-icons/fa";

interface ContactLinksProps {
  size?: number;
}

export function ContactLinks({ size = 30 }: ContactLinksProps) {
  return (
    <div className="p-1  flex  gap-4">
      <Link href="https://github.com/tigawanna" target="_blank">
        <FaGithub className="w-7 h-7 hover:text-secondary" />
      </Link>
      <Link href="https://linkedin.com/in/dennis-kinuthia" target="_blank">
        {" "}
        <FaLinkedinIn className="w-7 h-7 hover:text-secondary" />
      </Link>
      <Link href="https://dev.to/tigawanna" target="_blank">
        <FaDev className="w-7 h-7 hover:text-secondary" />
      </Link>
      <Link href="https://twitter.com/tigawanna" target="_blank">
        <FaTwitter className="w-7 h-7 hover:text-secondary" />
      </Link>
    </div>
  );
}
