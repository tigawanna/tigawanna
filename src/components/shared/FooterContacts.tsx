import Link from "next/link";
import { FaDev, FaGithub, FaLinkedinIn, FaPhone, FaWhatsapp } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { siteConfig } from "./container/site";

interface FooterContactsProps {
  className?: string;
}

export function FooterContacts({ className = "" }: FooterContactsProps) {
  const contactItems = [
    {
      icon: <FaGithub />,
      title: "GitHub",
      detail: "@" + siteConfig.links.nickname,
      url: siteConfig.links.github,
      label: "Follow",
    },
    {
      icon: <FaLinkedinIn />,
      title: "LinkedIn",
      detail: "Professional Profile",
      url: siteConfig.links.linkedin,
      label: "Connect",
    },
    {
      icon: <FaDev />,
      title: "Dev.to",
      detail: "@" + siteConfig.links.nickname,
      url: siteConfig.links.devto,
      label: "Read",
    },
    {
      icon: <HiOutlineMail />,
      title: "Email",
      detail: "denniskinuthiawaweru@gmail.com",
      url: siteConfig.links.email,
      label: "Write",
    },
    {
      icon: <FaWhatsapp />,
      title: "WhatsApp",
      detail: siteConfig.links.phone,
      url: siteConfig.links.whatsapp,
      label: "Chat",
    },
    {
      icon: <FaPhone />,
      title: "Phone",
      detail: siteConfig.links.phone,
      url: siteConfig.links.phoneDialer,
      label: "Call",
    },
  ];

  return (
    <div className={`flex flex-wrap gap-4 w-full ${className}`}>
      {contactItems.map((item, index) => (
        <div key={index} className="group flex-grow flex flex-col items-center p-4 rounded-lg bg-base-100/30 hover:bg-base-200 transition-all hover:shadow-md">
          <div className="text-2xl text-secondary group-hover:scale-110 transition-transform duration-200">
            {item.icon}
          </div>
          <h3 className="mt-2 font-semibold">{item.title}</h3>
          <p className="text-xs text-base-content/70 text-center mt-1">{item.detail}</p>
            <Link
          key={index}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-xs font-medium text-secondary opacity-80 group-hover:opacity-100">
            {item.label} →
          </Link>
        </div>
      ))}
    </div>
  );
}
