import { useScrollReveal } from "@/routes/-components/landing/hooks/use-scroll-reveal";
import { twMerge } from "tailwind-merge";
import { useRef, type ReactNode } from "react";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function RevealOnScroll({ children, className, delay = 0, y = 36 }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollReveal(ref, { delay, y });

  return (
    <div ref={ref} className={twMerge("opacity-0", className)}>
      {children}
    </div>
  );
}
