'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useTransform, type MotionValue } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Text reveal animation
export const revealVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1
    }
  }
};

export const wordRevealVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

// Split text into words for animations
export const splitText = (text: string) => {
  return text.split(' ').map((word, i) => ({
    word,
    key: i,
  }));
};

// Hook to create a parallax effect
export function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

// Hook for scroll-driven animations
export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: threshold });
  
  return { ref, isInView };
}

// Animate on scroll hook with GSAP
export function useGSAPAnimation(callback: (element: HTMLElement) => void) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    callback(ref.current);
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [callback]);
  
  return ref;
}

// Animated counter hook
export function useCounter(targetValue: number, duration: number = 2) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const inViewRef = useRef<HTMLDivElement>(null);
  const inView = useInView(inViewRef, { once: true });

  useEffect(() => {
    if (inView) {
      const startValue = 0;
      const startTime = performance.now();
      const endTime = startTime + duration * 1000;

      const updateCount = () => {
        const now = performance.now();
        const progress = Math.min((now - startTime) / (endTime - startTime), 1);
        const currentValue = Math.floor(progress * (targetValue - startValue) + startValue);

        if (countRef.current !== currentValue) {
          countRef.current = currentValue;
          setCount(currentValue);
        }

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };

      requestAnimationFrame(updateCount);
    }
  }, [inView, targetValue, duration]);

  return { count, ref: inViewRef };
}

// Morph animation controller
export class MorphController {
  element: HTMLElement;
  initialPath: string;
  targetPath: string;
  
  constructor(element: HTMLElement, initialPath: string, targetPath: string) {
    this.element = element;
    this.initialPath = initialPath;
    this.targetPath = targetPath;
  }
  
  animate(progress: number) {
    gsap.to(this.element, {
      attr: { d: progress === 1 ? this.targetPath : this.initialPath },
      duration: 0.5,
      ease: "power2.inOut",
    });
  }
}

// Smooth scroll with Lenis
export const initSmoothScroll = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Create Lenis instance with appropriate config
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    
    // Animation frame handler
    let rafId: number;
    
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    
    // Start the animation loop
    rafId = requestAnimationFrame(raf);
    
    // Create return object with cleanup function
    return {
      lenis,
      cleanup: () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (lenis && typeof lenis.destroy === 'function') lenis.destroy();
      }
    };
  } catch (error) {
    console.error('Failed to initialize smooth scroll:', error);
    return null;
  }
};
