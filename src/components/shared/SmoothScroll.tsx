"use client";

import { ReactNode, useEffect, useState } from "react";
import { initSmoothScroll } from "@/lib/animations/scroll-animations";

interface SmoothScrollProps {
  children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const [hasReducedMotion, setHasReducedMotion] = useState(false);
  
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = 
      typeof window !== 'undefined' 
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
        : false;
    
    setHasReducedMotion(prefersReducedMotion);
    
    // Skip smooth scroll for accessibility
    if (prefersReducedMotion) return;
    
    // Initialize smooth scroll
    const scrollInstance = initSmoothScroll();
    
    // Clean up
    return () => {
      if (scrollInstance && scrollInstance.cleanup) {
        scrollInstance.cleanup();
      }
    };
  }, []);

  return <>{children}</>;
}
