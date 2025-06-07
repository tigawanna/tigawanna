"use client";
import Link from "next/link";
import { FaDev, FaGithub, FaLinkedinIn, FaPhone, FaWhatsapp } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { siteConfig } from "./container/site";
import { CopyAllLinksButton } from "./CopyAlLinks";


interface ContactLinksProps {
  navbar?: boolean;
  footer?: boolean;
  size?: number;
  showText?: boolean;
  showCopyAll?: boolean;
}

export function ContactLinks({
  size = 30,
  navbar,
  showText,
  showCopyAll = true,
}: ContactLinksProps) {
  // Links data for cleaner rendering
  const links = [
    {
      href: siteConfig.links.github,
      title: siteConfig.links.nickname,
      icon: <FaGithub className="w-7 h-7" />,
      text: "GitHub",
    },
    {
      href: siteConfig.links.linkedin,
      title: "dennis-kinuthia",
      icon: <FaLinkedinIn className="w-7 h-7" />,
      text: "LinkedIn",
    },
    {
      href: siteConfig.links.devto,
      title: siteConfig.links.nickname,
      icon: <FaDev className="w-7 h-7" />,
      text: "Dev.to",
    },
    {
      href: siteConfig.links.emailTo,
      title: "Email me",
      icon: <HiOutlineMail className="w-7 h-7" />,
      text: "Email",
    },
    {
      href: siteConfig.links.whatsapp,
      title: "WhatsApp me",
      icon: <FaWhatsapp className="w-7 h-7" />,
      text: "WhatsApp",
    },
    {
      href: siteConfig.links.phoneDialer,
      title: "Call me",
      icon: <FaPhone className="w-7 h-7" />,
      text: "Call",
    },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        data-navbar={navbar}
        className="p-1 flex gap-3 glass md:data-[navbar=true]:flex-col rounded-lg px-2 z-50">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={link.title}
            className="flex items-center gap-2 hover:text-secondary active:scale-95 transition-transform">
            {link.icon}
            {showText && <span>{link.text}</span>}
          </Link>
        ))}
      </div>

      {showCopyAll && <CopyAllLinksButton className="mt-2" />}
    </div>
  );
}
