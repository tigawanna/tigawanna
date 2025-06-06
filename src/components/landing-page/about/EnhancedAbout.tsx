"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FadeIn} from "@/components/shared/animations/AnimatedComponents";
import { useAnimationPerformance, PerformanceLevel } from "@/lib/animations/use-animation-performance";
import { useOptimizedAnimation } from "@/lib/animations/use-optimized-animation";


// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function EnhancedAbout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

// Get performance and accessibility settings
  const { performanceLevel, isReducedMotion } = useAnimationPerformance();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Only apply parallax effects if user allows motion
  const opacity = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    isReducedMotion ? [1, 1, 1, 1] : [0, 1, 1, 0]
  );
  
  const y = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    isReducedMotion ? [0, 0, 0, 0] : [100, 0, 0, -100]
  );
  
  // Use our optimized animation hook for the title
  const { ref: titleRef, style: titleStyle } = useOptimizedAnimation('fadeInDown', {
    threshold: 0.1,
    once: true,
    duration: 0.8
  });
  
  useEffect(() => {

    
    // Skip GSAP animations if reduced motion is preferred
    if (isReducedMotion || !containerRef.current || !textRef.current) return;
    
    const paragraphs = textRef.current.querySelectorAll("p");
    
    // Adjust animation parameters based on performance level
    const duration = performanceLevel === PerformanceLevel.High ? 0.8 : 0.5;
    const staggerDelay = performanceLevel === PerformanceLevel.Low ? 0.1 : 0.2;
    
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 80%",
      animation: gsap.fromTo(
        paragraphs, 
        { 
          opacity: 0, 
          y: 20 
        }, 
        { 
          opacity: 1, 
          y: 0, 
          stagger: staggerDelay,
          duration: duration,
          ease: "power3.out" 
        }
      ),
      toggleActions: "play none none reverse"
    });
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isReducedMotion, performanceLevel]);

  // Skills to highlight
  const skills = [
    "React & Next.js", "TypeScript", "GraphQL", "Node.js", "Tailwind CSS & Material UI", 
    "React Native & Expo", "REST APIs", "Prisma & Drizzle", "TanStack", 
    "Authentication",
    "State Management", "Testing (Jest, React Testing Library)", "CI/CD",
    "Performance Optimization", "Accessibility (a11y)", "Code Reviews & Mentorship"
  ];

  return (
    <motion.div 
      ref={containerRef}
      className="relative  min-h-screen h-fit mb-20" // Added more padding at the bottom
      style={{ opacity, y }}
      id="about"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-base-300/30 via-transparent to-base-300/30"></div>
      
      <div className="container mx-auto px-6">
        <motion.h2
          ref={titleRef as any}
          style={titleStyle}
          className="text-4xl font-bold mb-10 text-center bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
        >
          About Me
        </motion.h2>
        
        <div className="grid grid-cols-1 gap-10 items-center">
          <FadeIn direction="up" className="w-full">
            <div ref={textRef} className="space-y-6 text-base-content/80 max-w-3xl mx-auto">
              <p>
                TypeScript enthusiast based in Nairobi, Kenya. With over 5 years of experience in fullstack development, I specialize in building exceptional web experiences using modern technologies.
              </p>
              <p>
                My expertise spans across various React frameworks, bundlers, and rendering strategies. I've spoken at tech conferences like Rendercon-KE about the React ecosystem and regularly participate in the local developer community.
              </p>
              <p>
                I excel at integrations with React and TypeScript, whether it's REST APIs, GraphQL clients like Apollo and Relay, tRPC, or service workers. I'm constantly learning and staying updated with the latest in the JavaScript/TypeScript world.
              </p>
              <p>
                My approach to development emphasizes type safety, clean architecture, and creating truly reusable components. I believe in writing maintainable code that scales well and provides an excellent user experience.
              </p>
              
              <div className="pt-4">
                <h3 className="text-xl font-semibold mb-3 text-primary">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <motion.span 
                      key={skill}
                      className=" font-medium bg-base-200/40 rounded-xl px-3 py-1 shadow-sm transition-transform hover:scale-105"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  <a 
                    href="https://docs.google.com/presentation/d/14q3-684ay5uK7Rhtp8ysj5ZVgCk_rsWsf7k9SFPHSKk/edit?usp=drivesdk" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary btn-outline"
                  >
                    View My RenderCon-KE Talk
                  </a>
                  <a 
                    href="https://github.com/tigawanna/ReactDevsKe-Meetup-February-2025" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-secondary btn-outline"
                  >
                    React Devs KE Presentation
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </motion.div>
  );
}
