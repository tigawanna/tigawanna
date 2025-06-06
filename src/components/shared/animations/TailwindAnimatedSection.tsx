"use client";

import { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/animations/tailwind-animations";

interface TailwindAnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

export function TailwindAnimatedSection({
  children,
  className = "",
  delay = 0,
  id,
}: TailwindAnimatedSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // If user prefers reduced motion, don't animate
  if (prefersReducedMotion) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

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
    <section 
      id={id}
      className={`
        animate-in fade-in slide-in-from-bottom-4 duration-700 ${getDelayClass()}
        @starting-style:opacity-0 @starting-style:translate-y-6
        ${className}
      `}
    >
      {children}
    </section>
  );
}
