"use client";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import { usePrefersReducedMotion } from "@/lib/animations/tailwind-animations";

export default function Intro() {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  return (
    <div className="w-full min-h-[90vh] flex justify-center items-center">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Side-by-side layout with flex-col on small screens */}
        <div className="flex flex-col md:flex-row md:justify-center items-center gap-8 md:gap-10 lg:gap-12 xl:gap-16 mx-auto">
          
          {/* Hero Image with enhanced Tailwind animations */}
          <div className="relative md:w-5/12 lg:w-1/3 xl:w-1/4 order-1">
            <div className="
              relative
              w-56 h-56 sm:w-60 sm:h-60 md:w-64 md:h-64 lg:w-56 lg:h-56 xl:w-64 xl:h-64
              group
              animate-in zoom-in-50 duration-700 ease-out
              @starting-style:opacity-0 @starting-style:scale-90
            ">
              {/* Animated glow effect using custom animations */}
              <div className={`
                absolute inset-0 -z-10 animate-in fade-in duration-1000
                before:absolute before:inset-0 before:bg-primary/30 before:rounded-full before:blur-2xl 
                ${!prefersReducedMotion && 'before:animate-pulse-gentle'}
                after:absolute after:inset-0 after:bg-secondary/20 after:rounded-full after:blur-xl 
                ${!prefersReducedMotion && 'after:animate-pulse-subtle'}
              `}></div>
              
              <div className="
                w-full h-full
                rounded-full overflow-hidden 
                shadow-xl border-4 border-primary/30 
                relative z-10
                motion-safe:animate-in motion-safe:fade-in-50 motion-safe:spin-in-3 motion-safe:duration-1000
                @starting-style:opacity-0 @starting-style:rotate-3
                transition-all duration-500
                hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/60
              ">
                <Image
                  src="/moi.jpg"
                  alt="Dennis Kinuthia"
                  fill
                  sizes="(max-width: 640px) 224px, (max-width: 768px) 240px, (max-width: 1024px) 256px, (max-width: 1280px) 224px, 256px"
                  className="object-cover"
                  priority
                  quality={90}
                />
                
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/20 opacity-60"></div>
              </div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="md:w-7/12 lg:w-3/5 xl:w-1/2 md:text-left text-center order-2">
            {/* Name with enhanced animation */}
            <div className="
              animate-in slide-in-from-bottom-4 fade-in duration-700 ease-out
              @starting-style:opacity-0 @starting-style:translate-y-6
            ">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Dennis Kinuthia
              </h1>
            </div>
            
            {/* Job Title with TypeAnimation - enhanced animation */}
            <div className="
              mt-2 mb-6 md:mb-8
              animate-in slide-in-from-bottom-6 fade-in duration-700 delay-300 ease-in-out
              @starting-style:opacity-0 @starting-style:translate-y-8
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
            
            {/* Brief Introduction with enhanced animation */}
            <div className="
              animate-in slide-in-from-bottom-8 fade-in duration-700 delay-500 ease-in-out
              @starting-style:opacity-0 @starting-style:translate-y-10
            ">
              <p className="text-base-content/80 text-base md:text-lg max-w-xl mx-auto md:mx-0">
                I create fast, accessible, and modern web applications with TypeScript, React, and Next.js. 
                Based in Nairobi, Kenya, I'm passionate about developer experience and building elegant 
                solutions to complex problems.
              </p>
            </div>
            
            {/* CTA Buttons with staggered animations */}
            <div className="
              mt-6 md:mt-8 flex flex-wrap gap-4 justify-center md:justify-start
              animate-in slide-in-from-bottom-10 fade-in duration-700 delay-700 ease-in-out
              @starting-style:opacity-0 @starting-style:translate-y-12
            ">
              <a 
                href="#about" 
                className="
                  btn btn-primary transition-all duration-300 
                  hover:scale-105 hover:shadow-lg hover:shadow-primary/20
                  animate-in zoom-in-95 slide-in-from-left-2 duration-1000 delay-900
                  @starting-style:opacity-0 @starting-style:translate-x-2
                "
              >
                Learn More
              </a>
              <a 
                href="#contact" 
                className="
                  btn btn-outline transition-all duration-300 
                  hover:scale-105 hover:border-primary/60
                  animate-in zoom-in-95 slide-in-from-left-2 duration-1000 delay-1000
                  @starting-style:opacity-0 @starting-style:translate-x-2
                "
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
