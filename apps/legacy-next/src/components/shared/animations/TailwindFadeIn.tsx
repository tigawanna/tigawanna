"use client";

import { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/animations/tailwind-animations";

interface TailwindFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function TailwindFadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: TailwindFadeInProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // If user prefers reduced motion, don't animate
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  // Compute animation classes based on direction
  const getDirectionClasses = () => {
    switch (direction) {
      case "up":
        return "slide-in-from-bottom";
      case "down":
        return "slide-in-from-top";
      case "left":
        return "slide-in-from-right";
      case "right":
        return "slide-in-from-left";
      default:
        return "slide-in-from-bottom";
    }
  };

  // Compute delay classes
  const getDelayClass = () => {
    const delayMap: Record<number, string> = {
      0: "",
      0.1: "delay-100",
      0.2: "delay-200",
      0.3: "delay-300",
      0.4: "delay-400",
      0.5: "delay-500",
      0.6: "delay-600",
      0.7: "delay-700",
      0.8: "delay-800",
      0.9: "delay-900",
      1: "delay-1000",
    };

    return delayMap[delay] || "";
  };

  return (
    <div 
      className={`
        animate-in ${getDirectionClasses()} duration-500 ${getDelayClass()}
        @starting-style:opacity-0 @starting-style:translate-y-4
        ${className}
      `}
    >
      {children}
    </div>
  );
}
