"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useOptimizedAnimation } from "@/lib/animations/use-optimized-animation";
import { useAnimationPerformance } from "@/lib/animations/use-animation-performance";

interface TechItemProps {
  name: string;
  icon: string;
  category: 'frontend' | 'backend' | 'tool';
  delay: number;
}

function TechItem({ name, icon, category, delay }: TechItemProps) {
  const { performanceLevel, isReducedMotion } = useAnimationPerformance();
  
  // Use our optimized animation hook
  const { ref, style: animationStyle } = useOptimizedAnimation('fadeIn', {
    threshold: 0.1,
    once: true,
    delay: isReducedMotion ? 0 : delay * 0.05,
    duration: 0.4
  });
  
  const categories = {
    frontend: "bg-gradient-to-r from-primary/30 to-secondary/30",
    backend: "bg-gradient-to-r from-secondary/30 to-accent/30",
    tool: "bg-gradient-to-r from-accent/30 to-primary/30"
  };

  return (
    <motion.div
        ref={ref as any}
        style={animationStyle}
        className={`tech-item flex flex-col items-center justify-between p-5 rounded-lg ${categories[category]} backdrop-blur-sm h-full relative overflow-hidden`}
        whileHover={{ scale: 1.02 }}  // Subtle scale effect on hover
        transition={{ duration: 0.2 }} // Quick and smooth
    >
        {/* Full size image covering the entire card */}
        <div className="absolute inset-0 w-full h-full">
            <Image
                src={icon}
                alt={name}
                fill
                sizes="100%"
                className="object-contain p-2"
            />
        </div>
        
        {/* Text positioned at the bottom with a gradient overlay for better readability */}
        <div className="mt-auto w-full absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-base-100/70 to-transparent">
            <span className="text-base font-medium text-center block">{name}</span>
        </div>
    </motion.div>
  );
}

interface TechStackProps {
  title?: string;
  description?: string;
}

export function ImprovedTechStack({ 
  title = "Technologies I Work With", 
  description = "A collection of technologies I use to create exceptional web experiences" 
}: TechStackProps) {
  // Use only favorite technologies (limited to 8)
  const favoriteLanguages = [
    { name: "TypeScript", icon: "/frameworks/ts.png", category: "frontend" as const },
    { name: "React", icon: "/frameworks/react.png", category: "frontend" as const },
    { name: "Next.js", icon: "/frameworks/next.png", category: "frontend" as const },
    { name: "Node.js", icon: "/frameworks/node.png", category: "backend" as const },
    { name: "Tailwind", icon: "/blobby.svg", category: "frontend" as const },
    { name: "GraphQL", icon: "/frameworks/relay.webp", category: "backend" as const },
    { name: "Vite", icon: "/frameworks/vite.svg", category: "tool" as const },
    { name: "Deno", icon: "/frameworks/deno.png", category: "backend" as const }
  ];

  // Use optimized animations for section title and description
  const { ref: titleRef, style: titleStyle } = useOptimizedAnimation('fadeInDown', {
    threshold: 0.1,
    once: true,
    duration: 0.6
  });
  
  const { ref: descRef, style: descStyle } = useOptimizedAnimation('fadeIn', {
    threshold: 0.1,
    once: true,
    delay: 0.2,
    duration: 0.6
  });

  return (
    <div className="py-16" id="tech">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            ref={titleRef as any}
            style={titleStyle}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
          >
            {title}
          </motion.h2>
          <motion.p 
            ref={descRef as any}
            style={descStyle}
            className="text-base-content/70 max-w-xl mx-auto"
          >
            {description}
          </motion.p>
        </div>

        <div className="relative">
          {/* Decorative background shapes with reduced blur for better performance */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 filter blur-2xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-secondary/10 filter blur-2xl"></div>
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10"
          >
            {favoriteLanguages.map((tech, index) => (
              <TechItem 
                key={tech.name} 
                name={tech.name} 
                icon={tech.icon} 
                category={tech.category}
                delay={index} 
              />
            ))}
          </div>
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-base-content/70 mb-4">
            Always learning and exploring new technologies to create better user experiences.
          </p>
          <div className="text-sm inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-200">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            Currently exploring Golang and modern build tools
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ImprovedTechStack;
