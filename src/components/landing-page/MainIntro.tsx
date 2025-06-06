"use client";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import { usePrefersReducedMotion } from "@/lib/animations/tailwind-animations";

export default function Intro() {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  return (
    <div className="w-full min-h-screen flex justify-center items-center ">
      <div className="container mx-auto px-6">
        {/* Side-by-side layout with flex-col on small screens */}
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-10 md:gap-16">
          
          {/* Hero Image with Tailwind animations */}
          <div className="relative md:w-2/5 lg:w-1/3 order-1">
            <div className="
              relative
              size-64 md:w-64 md:h-64
              group
              animate-in zoom-in-50 duration-700
              @starting-style:opacity-0 @starting-style:scale-90
            ">
              {/* Animated glow effect using Tailwind CSS */}
              <div className={`
                absolute inset-0 -z-10 
                before:absolute before:inset-0 before:bg-primary/30 before:rounded-full before:blur-2xl ${!prefersReducedMotion && 'before:animate-pulse'}
                after:absolute after:inset-0 after:bg-secondary/20 after:rounded-full after:blur-xl ${!prefersReducedMotion && 'after:animate-pulse after:animation-delay-300'}
              `}></div>
              
              <div className="
                w-full h-full
                rounded-full overflow-hidden 
                shadow-xl border-4 border-primary/30 
                relative z-10
                transition-all duration-300
                hover:scale-105 hover:shadow-2xl hover:shadow-primary/20
              ">
                <Image
                  src="/moi.jpg"
                  alt="Dennis Kinuthia"
                  width={340}
                  height={340}
                  className="object-cover"
                  priority
                />
                
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/20 opacity-60"></div>
              </div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="md:w-1/5 lg:w-2/3 md:text-left text-center order-2">
            {/* Name with animation */}
            <div className="
              animate-in slide-in-from-bottom fade-in duration-700
              @starting-style:opacity-0 @starting-style:translate-y-4
            ">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Dennis Kinuthia
              </h1>
            </div>
            
            {/* Job Title with TypeAnimation */}
            <div className="
              mt-2 mb-8
              animate-in slide-in-from-bottom fade-in duration-700 delay-200
              @starting-style:opacity-0 @starting-style:translate-y-4
            ">
              <h2 className="text-xl md:text-2xl font-medium text-base-content/80">
                <TypeAnimation
                  sequence={[
                    "Full Stack Developer",
                    1000,
                    "TypeScript Enthusiast",
                    1000,
                    "Next.js Developer",
                    300,
                    "Node.js Developer",
                    300,
                    "Solutions Architect",
                    1000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </h2>
            </div>
            
            {/* Brief Introduction with animation */}
            <div className="
              animate-in slide-in-from-bottom fade-in duration-700 delay-300
              @starting-style:opacity-0 @starting-style:translate-y-4
            ">
              <p className="text-base-content/70 text-lg">
                I create fast, accessible, and modern web applications with TypeScript, React, and Next.js. 
                Based in Nairobi, Kenya, I'm passionate about developer experience and building elegant 
                solutions to complex problems.
              </p>
            </div>
            
            {/* CTA Buttons with animation */}
            <div className="
              mt-8 flex flex-wrap gap-4 justify-center md:justify-start
              animate-in slide-in-from-bottom fade-in duration-700 delay-500
              @starting-style:opacity-0 @starting-style:translate-y-4
            ">
              <a 
                href="#about" 
                className="btn btn-primary transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
              >
                Learn More
              </a>
              <a 
                href="#contact" 
                className="btn btn-outline transition-all duration-300 hover:scale-105"
              >
                Contact Me
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
