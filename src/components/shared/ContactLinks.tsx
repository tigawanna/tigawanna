import Link from "next/link";
import { FaGithub, FaLinkedinIn, FaDev, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
interface ContactLinksProps {
  size?: number;
}

export function ContactLinks({ size = 30 }: ContactLinksProps) {
  const contacts ={
     nickname:"tigawanna",
    phone:"+254790984481",
    email:"denniskinuthiawaweru@gmail.com"
  }
  return (
    <div className="p-1  flex  gap-4">
      <Link
        href={"https://github.com/" + contacts.nickname}
        target="_blank"
        rel="noopener noreferrer"
        title={contacts.nickname}>
        <FaGithub className="w-7 h-7 hover:text-secondary" />
      </Link>
      <Link
        href="https://linkedin.com/in/dennis-kinuthia"
        target="_blank"
        rel="noopener noreferrer"
        title={"dennis-kinuthia"}>
        {" "}
        <FaLinkedinIn className="w-7 h-7 hover:text-secondary" />
      </Link>
      <Link
        href={"https://dev.to/" + contacts.nickname}
        target="_blank"
        rel="noopener noreferrer"
        title={contacts.nickname}>
        <FaDev className="w-7 h-7 hover:text-secondary" />
      </Link>
      <Link
        href={"https://twitter.com/" + contacts.nickname}
        target="_blank"
        rel="noopener noreferrer"
        title={contacts.nickname}>
        <FaTwitter className="w-7 h-7 hover:text-secondary" />
      </Link>
      <Link
        href={"mailto:" + contacts.email}
        target="_blank"
        rel="noopener noreferrer"
        title={contacts.email}>
        <HiOutlineMail className="w-7 h-7 hover:text-secondary" />
      </Link>
      <Link
        href={"https://wa.me/" + contacts.phone}
        target="_blank"
        rel="noopener noreferrer"
        title={contacts.phone}>
        <FaWhatsapp className="w-7 h-7 hover:text-secondary" />
      </Link>
    </div>
  );
}
