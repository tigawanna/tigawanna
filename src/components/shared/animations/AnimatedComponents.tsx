"use client";

import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
// Import from our updated scroll animations
import { revealVariants, useScrollAnimation } from "@/lib/animations/scroll-animations";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  id?: string;
}

export function AnimatedSection({ 
  children, 
  className = "", 
  delay = 0,
  threshold = 0.1,
  id
}: AnimatedSectionProps) {
  const { ref, isInView } = useScrollAnimation(threshold);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      // Listen for changes
      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  // Skip animations for users who prefer reduced motion
  if (prefersReducedMotion) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={revealVariants}
      transition={{
        delay: delay,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.section>
  );
}

interface AnimatedTextProps {
  text: string;
  className?: string;
  element?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  delay?: number;
  threshold?: number;
}

export function AnimatedText({
  text,
  className = "",
  element = "p",
  delay = 0,
  threshold = 0.1
}: AnimatedTextProps) {
  const { ref, isInView } = useScrollAnimation(threshold);
  const words = text.split(" ");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const Tag = element;
  
  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      // Listen for changes
      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);
  
  // Skip animations for users who prefer reduced motion
  if (prefersReducedMotion) {
    return (
      <Tag className={className}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag className={className} ref={ref}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ delayChildren: delay, staggerChildren: 0.05 }}
        className="inline-block"
      >
        {words.map((word, i) => (
          <span className="inline-block" key={`${word}-${i}`}>
            {word.split("").map((char, j) => (
              <motion.span
                key={`${char}-${j}`}
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
              >
                {char}
              </motion.span>
            ))}
            <span className="inline-block">&nbsp;</span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}

export function ParallaxImage({
  src,
  alt,
  className = "",
  speed = 0.5,
}: ParallaxImageProps) {
  const { ref, isInView } = useScrollAnimation(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      // Listen for changes
      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);
  
  // Skip the parallax effect for users who prefer reduced motion
  if (prefersReducedMotion) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className="w-full h-full">
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }
  
  // Adjust speed based on device capabilities
  const adjustedSpeed = speed * 0.5;
  
  return (
    <div className={`relative overflow-hidden ${className}`} ref={ref}>
      <motion.div
        initial={{ scale: 1.2 }}
        animate={isInView ? { y: `${-adjustedSpeed * 10}%`, scale: 1 } : { y: "0%", scale: 1.2 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.22, 1, 0.36, 1],
          // Use lighter animations for better performance
          type: "tween" 
        }}
        className="w-full h-full"
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </motion.div>
    </div>
  );
}

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 30,
}: FadeInProps) {
  const { ref, isInView } = useScrollAnimation(0.1);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      // Listen for changes
      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);
  
  const getDirectionOffset = () => {
    // Adjust distance based on performance considerations
    const adjustedDistance = prefersReducedMotion ? 0 : distance;
    
    switch (direction) {
      case "up": return { y: adjustedDistance };
      case "down": return { y: -adjustedDistance };
      case "left": return { x: adjustedDistance };
      case "right": return { x: -adjustedDistance };
      default: return { y: adjustedDistance };
    }
  };
  
  // Skip animations for users who prefer reduced motion
  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }
  
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...getDirectionOffset() }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...getDirectionOffset() }}
      transition={{ 
        duration: 0.6, 
        delay, 
        ease: [0.22, 1, 0.36, 1] 
      }}
    >
      {children}
    </motion.div>
  );
}
