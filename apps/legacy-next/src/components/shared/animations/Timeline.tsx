"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FadeIn } from "./AnimatedComponents";
import { useOptimizedAnimation } from "@/lib/animations/use-optimized-animation";

interface TimelineItemProps {
  year: string;
  title: string;
  description: string;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function TimelineItem({ 
  year, 
  title, 
  description, 
  index, 
  isActive,
  onClick 
}: TimelineItemProps) {
  // Use our optimized animation hook with accessibility support
  const { ref, isInView, style } = useOptimizedAnimation(
    'fadeInUp',
    { 
      once: true, 
      threshold: 0.5,
      delay: index * 0.1,
      duration: 0.6
    }
  );
  
  // Fallback variants for the motion component
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
    }
  }, []);
  
  return (
    <motion.div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`relative cursor-pointer ${index % 2 === 0 ? 'md:text-right md:self-start' : 'md:self-end'} w-full md:w-[45%]`}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={prefersReducedMotion ? {} : variants}
      transition={{ 
        duration: prefersReducedMotion ? 0 : 0.6, 
        delay: prefersReducedMotion ? 0 : index * 0.1 
      }}
      onClick={onClick}
    >
      <div 
        className={`p-4 rounded-lg transition-all duration-300 ${
          isActive 
            ? 'bg-primary/10 shadow-lg scale-105 border-l-4 border-primary' 
            : 'bg-base-200 hover:bg-base-300'
        }`}
      >
        <span className="badge badge-primary mb-2">{year}</span>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm mt-2 text-base-content/70">{description}</p>
      </div>
      
      {/* Line and dot */}
      <div className={`absolute top-1/2 ${index % 2 === 0 ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'} hidden md:block`}>
        <div className={`w-4 h-4 rounded-full ${isActive ? 'bg-primary' : 'bg-secondary'} transition-colors duration-300`}></div>
      </div>
    </motion.div>
  );
}

interface TimelineProps {
  items: {
    year: string;
    title: string;
    description: string;
  }[];
}

export function Timeline({ items }: TimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setActiveIndex(index);
          }
        });
      },
      { threshold: 0.5 }
    );
    
    const children = ref.current.children;
    for (let i = 0; i < children.length; i++) {
      if (children[i] instanceof HTMLElement) {
        children[i].setAttribute('data-index', i.toString());
        observer.observe(children[i]);
      }
    }
    
    return () => {
      for (let i = 0; i < children.length; i++) {
        observer.unobserve(children[i]);
      }
    };
  }, []);
  
  return (
    <FadeIn>
      <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Professional Journey</h2>
      <div className="relative">
        {/* Center vertical line with grow animation - hidden on mobile */}
        <motion.div 
          className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-secondary to-primary/20 hidden md:block"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "100%", opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        ></motion.div>
        
        <div ref={ref} className="flex flex-col gap-8 md:gap-12 relative">
          {items.map((item, i) => (
            <TimelineItem
              key={i}
              year={item.year}
              title={item.title}
              description={item.description}
              index={i}
              isActive={i === activeIndex}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
