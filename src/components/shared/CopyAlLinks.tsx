"use client";
import { useCallback, useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { siteConfig } from "./container/site";
import toast from "react-hot-toast";

interface CopyAllLinksButtonProps {
  className?: string;
  title?: string;
  showTitle?: boolean;
}

export function CopyAllLinksButton({
  className = "",
  title = "Copy all contact links",
   showTitle = false,
}: CopyAllLinksButtonProps) {
  const [copying, setCopying] = useState(false);

  const copyAllLinks = useCallback(async () => {
    setCopying(true);

    // Important links to copy in sequence
    const linksToCopy = [
      { name: "Phone", url: siteConfig.links.phone },
      { name: "WhatsApp", url: siteConfig.links.whatsapp },
      { name: "Email", url: siteConfig.links.email.replace("mailto:", "") },
      { name: "Portfolio", url: window.location.origin },
      { name: "GitHub", url: siteConfig.links.github },
      { name: "LinkedIn", url: siteConfig.links.linkedin },
    ];

    try {
      // Copy each link with a slight delay to ensure they appear in sequence in clipboard history
      for (const link of linksToCopy) {
        await navigator.clipboard.writeText(link.url);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      toast.success("All links copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy links:", error);
      toast.error("Failed to copy links");
    } finally {
      setCopying(false);
    }
  }, []);

  return (
    <button
      onClick={copyAllLinks}
      className={`btn btn-sm btn-ghost gap-2 ${copying ? "btn-disabled" : ""} ${className}`}
      title={title}
      aria-label={title}
      disabled={copying}>
      {copying ? (
        <>
          <FiCheck className="w-4 h-4" />
        </>
      ) : (
        <>
          <FiCopy className="w-4 h-4" />
          {showTitle && <span>{title}</span>}
        </>
      )}
    </button>
  );
}
