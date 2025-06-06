"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { useGSAPAnimation } from "@/lib/animations/scroll-animations";

interface TechItemProps {
  name: string;
  icon: string;
  category: 'frontend' | 'backend' | 'tool';
  delay: number;
}

function TechItem({ name, icon, category, delay }: TechItemProps) {
  const categories = {
    frontend: "bg-gradient-to-r from-primary/30 to-secondary/30",
    backend: "bg-gradient-to-r from-secondary/30 to-accent/30",
    tool: "bg-gradient-to-r from-accent/30 to-primary/30"
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: delay * 0.05  // Reduced delay for smoother appearance
      }
    }
  };

  return (
    <motion.div
      className={`tech-item flex flex-col items-center p-4 rounded-lg ${categories[category]} backdrop-blur-sm`}
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}  // Only scale on hover, no y-movement
      transition={{ duration: 0.2 }} // Make hover effect quick and smooth
    >
      <div className="relative w-16 h-16 mb-3"> {/* Increased size */}
        <Image
          src={icon}
          alt={name}
          fill
          sizes="64px" 
          className="object-contain"
        />
      </div>
      <span className="text-sm font-medium">{name}</span> {/* Slightly larger text */}
    </motion.div>
  );
}

interface TechStackProps {
  title?: string;
  description?: string;
}

export function TechStack({ 
  title = "Technologies I Work With", 
  description = "A collection of technologies I use to create exceptional web experiences" 
}: TechStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const technologies = [
    { name: "React", icon: "/frameworks/react.png", category: "frontend" as const },
    { name: "Next.js", icon: "/frameworks/next.png", category: "frontend" as const },
    { name: "TypeScript", icon: "/frameworks/ts.png", category: "frontend" as const },
    { name: "Node.js", icon: "/frameworks/node.png", category: "backend" as const },
    { name: "Tailwind", icon: "/blobby.svg", category: "frontend" as const },
    { name: "GraphQL", icon: "/frameworks/relay.webp", category: "backend" as const },
    { name: "Deno", icon: "/frameworks/deno.png", category: "backend" as const },
    { name: "Go", icon: "/frameworks/bun.png", category: "backend" as const },
    { name: "Vite", icon: "/frameworks/vite.svg", category: "tool" as const },
    { name: "Remix", icon: "/frameworks/remix.jpg", category: "frontend" as const },
    { name: "Qwik", icon: "/frameworks/qwik.png", category: "frontend" as const },
    { name: "Solid", icon: "/frameworks/solid.jpg", category: "frontend" as const },
    { name: "Astro", icon: "/frameworks/astro.jpeg", category: "frontend" as const },
    { name: "Svelte", icon: "/frameworks/svelte.png", category: "frontend" as const }
  ];

  // Remove the floating animation reference
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

  return (
    <div className="py-16 h-screen min-h-fit" id="tech">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4"
      >
        <div className="text-center mb-12">
          <motion.h2 
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h2>
          <motion.p 
            className="text-base-content/70 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {description}
          </motion.p>
        </div>

        <div className="relative">
          {/* Decorative background shapes */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 filter blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-secondary/10 filter blur-3xl"></div>
          </div>

          <motion.div
            ref={containerRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 relative z-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {technologies.map((tech, index) => (
              <TechItem 
                key={tech.name} 
                name={tech.name} 
                icon={tech.icon} 
                category={tech.category}
                delay={index} 
              />
            ))}
          </motion.div>
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
      </motion.div>
    </div>
  );
}
