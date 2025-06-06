"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FadeIn } from "@/components/shared/animations/AnimatedComponents";

interface TechItemProps {
  name: string;
  icon: string;
  category: 'frontend' | 'backend' | 'tool';
  index: number;
}

function TechItem({ name, icon, category, index }: TechItemProps) {
  const categories = {
    frontend: "bg-gradient-to-r from-primary/30 to-secondary/30",
    backend: "bg-gradient-to-r from-secondary/30 to-accent/30",
    tool: "bg-gradient-to-r from-accent/30 to-primary/30"
  };

  return (
    <FadeIn 
      delay={index * 0.1} 
      className={`flex flex-col items-center p-5 rounded-lg ${categories[category]} backdrop-blur-sm h-full`}
    >
      <div className="w-20 h-20 mb-4"> {/* Fixed size without position:relative */}
        <Image
          src={icon}
          alt={name}
          width={80}
          height={80}
          className="object-contain"
        />
      </div>
      <span className="text-base font-medium text-center">{name}</span>
    </FadeIn>
  );
}

interface SimplifiedTechStackProps {
  title?: string;
  description?: string;
}

export function SimplifiedTechStack({ 
  title = "Technologies I Work With", 
  description = "A collection of technologies I use to create exceptional web experiences" 
}: SimplifiedTechStackProps) {
  // Only favorite languages, limited to 8
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
    <div className="py-16" id="tech">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <FadeIn className="mb-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {title}
            </h2>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p className="text-base-content/70 max-w-xl mx-auto">
              {description}
            </p>
          </FadeIn>
        </div>

        {/* Simple grid without position:relative */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {favoriteLanguages.map((tech, index) => (
            <TechItem 
              key={tech.name} 
              name={tech.name} 
              icon={tech.icon} 
              category={tech.category}
              index={index}
            />
          ))}
        </div>

        <FadeIn delay={0.4} className="mt-16 text-center">
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
        </FadeIn>
      </div>
    </div>
  );
}

export default SimplifiedTechStack;
