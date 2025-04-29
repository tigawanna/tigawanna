"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { makeHotToast } from "./toasters";
import toast from "react-hot-toast";




interface CopyButtonProps {
  text: string;
  displayText?: string;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  showFullText?: boolean;
  show?: boolean;
  showToast?: boolean;
}

export function CopyButton({
  text,
  displayText,
  className,
  variant = "ghost",
  showFullText = true,
  show = true,
  showToast = true,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      showToast &&
        toast.success("Copied to clipboard")
        // makeHotToast({
        //   title: "Copied to clipboard",
        //   description: "Text has been copied to your clipboard",
        //   duration: 2000,
        //   position: "top-center",
        //   variant: "success",
        // });

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      showToast &&
      toast.error("Failed to copy text")
        // makeHotToast({
        //   title: "Failed to copy",
        //   description: "There was an error copying to clipboard",
        //   variant: "error",
        //   position: "top-center",
        // });
    }
  };

  // Display either the provided display text or the original text
  const textToShow = displayText || text;

  // If we don't want to show the full text, truncate it
  const displayValue =
    !showFullText && textToShow.length > 40 ? `${textToShow.substring(0, 40)}...` : textToShow;
  if (!show) return null;
  return (
    <div
      className={`flex items-center gap-2 bg-primary/10 rounded-md  p-1 
        ${copied ? "animate-pulse" : ""} ${className}`}>
      <div className="flex-1 font-mono text-sm break-all">{displayValue}</div>
      <button  onClick={handleCopy} className="flex-shrink-0 btn btn-sm">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
