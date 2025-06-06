"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/shared/animations/AnimatedComponents";
import { siteConfig } from "../shared/container/site";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function SimplifiedIntro() {
  // Simple fade-in animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  return (
    <div className="w-full pt-20 pb-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-10 text-center">
          {/* Enhanced Hero Image with glow effect */}
          <div className="relative">
            {/* Animated glow effect behind the image */}
            <div className="absolute inset-0 -z-10 animate-pulse-slow">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-56 md:h-56 bg-primary/30 rounded-full blur-2xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-56 md:h-56 bg-secondary/20 rounded-full blur-xl"></div>
            </div>
            
            <motion.div 
              className="w-48 h-48 md:w-56 md:h-56 mb-6 rounded-full overflow-hidden shadow-xl border-4 border-primary/30 relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            >
              <Image
                src="/moi.jpg"
                alt="Dennis Kinuthia"
                width={240}
                height={240}
                className="object-cover"
                priority
              />
              
              {/* Subtle overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/20 opacity-60"></div>
            </motion.div>
          </div>
          
          {/* Name and Title */}
          <div>
            <FadeIn className="mb-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Dennis Kinuthia
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.2} className="mb-8">
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
            </FadeIn>
          </div>
          
          {/* Brief Introduction */}
          <FadeIn delay={0.4} className="max-w-2xl">
            <p className="text-base-content/70 text-lg">
              I create fast, accessible, and modern web applications with TypeScript, React, and Next.js. Based in Nairobi, Kenya, I'm passionate about developer experience and building elegant solutions to complex problems.
            </p>
          </FadeIn>
          
          {/* CTA Buttons */}
          <FadeIn delay={0.6} className="flex flex-wrap gap-4 justify-center">
            <a 
              href="#about" 
              className="btn btn-primary"
            >
              Learn More
            </a>
            <a 
              href="#contact" 
              className="btn btn-outline"
            >
              Contact Me
            </a>

          </FadeIn>
        </div>
      </div>
    </div>
  );
}
