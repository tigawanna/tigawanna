"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FadeIn } from "@/components/shared/animations/AnimatedComponents";

export function CondensedAbout() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  
  // Skills for the marquee
  const skills = [
    "React & Next.js", "TypeScript", "GraphQL", "Node.js", "Tailwind CSS", 
    "React Native", "REST APIs", "Prisma & Drizzle", "TanStack", "Authentication",
    "State Management", "Testing", "CI/CD", "Performance Optimization", "Accessibility"
  ];
  
  // Duplicate the skills array to ensure continuous loop
  const duplicatedSkills = [...skills, ...skills];
  
  useEffect(() => {
    // No position:relative-related animations here
  }, []);

  return (
    <div className="w-full py-16" id="about">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <FadeIn className="mb-10">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            About Me
          </h2>
        </FadeIn>
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Profile Image (on larger screens) */}
          <FadeIn className="hidden md:block">
            <Image
              src="/moi.jpg"
              alt="Dennis Kinuthia"
              height={280}
              width={280}
              className="rounded-lg shadow-md mx-auto object-cover"
              priority
            />
          </FadeIn>
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio Text */}
            <FadeIn className="text-base-content/80 space-y-4">
              <p>
                TypeScript enthusiast based in Nairobi, Kenya with over 5 years of fullstack development experience. I specialize in building exceptional web experiences using modern technologies.
              </p>
              <p>
                My expertise spans across React frameworks, bundlers, and rendering strategies. I've spoken at tech conferences like Rendercon-KE about the React ecosystem and regularly participate in the local developer community.
              </p>
              <p>
                I excel at integrations with React and TypeScript, whether it's REST APIs, GraphQL clients like Apollo and Relay, tRPC, or service workers. My approach emphasizes type safety, clean architecture, and creating truly reusable components.
              </p>
            </FadeIn>
            
            {/* Enhanced Talks Section */}
            <FadeIn delay={0.2} className="pt-4">
              <div className="bg-base-200/50 rounded-2xl p-5 border border-primary/10 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Conference Talks & Presentations
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* RenderCon Talk */}
                  <motion.a 
                    href="https://docs.google.com/presentation/d/14q3-684ay5uK7Rhtp8ysj5ZVgCk_rsWsf7k9SFPHSKk/edit?usp=drivesdk" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 bg-gradient-to-br from-primary/10 to-primary/30 rounded-xl hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group"
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/20 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                        <path d="M12 14v10"></path>
                      </svg>
                    </div>
                    <h4 className="font-bold text-lg mb-1">RenderCon-KE</h4>
                    <p className="text-sm text-base-content/70 mb-3">Exploring Modern React Rendering Strategies</p>
                    
                    {/* Engagement metrics */}
                    <div className="flex justify-center gap-3 mb-3">
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        250+ Views
                      </span>
                      <span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Featured
                      </span>
                    </div>
                    
                    <span className="text-primary text-sm inline-flex items-center group-hover:underline">
                      View Presentation
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </motion.a>

                  {/* React Devs KE Presentation */}
                  <motion.a 
                    href="https://github.com/tigawanna/ReactDevsKe-Meetup-February-2025" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/30 rounded-xl hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group"
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/20 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 8l4 4-4 4M8 12h8"></path>
                      </svg>
                    </div>
                    <h4 className="font-bold text-lg mb-1">React Devs KE</h4>
                    <p className="text-sm text-base-content/70 mb-3">TypeScript + React: Building Type-Safe Applications</p>
                    
                    {/* Engagement metrics */}
                    <div className="flex justify-center gap-3 mb-3">
                      <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.258a12.217 12.217 0 019.742 9.742h.258a.75.75 0 010 1.5h-.258A12.217 12.217 0 0110.75 17.992v.258a.75.75 0 01-1.5 0v-.258A12.217 12.217 0 01.508 11.25H.25a.75.75 0 010-1.5h.258A12.217 12.217 0 019.25 3.008V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
                        </svg>
                        180+ Stars
                      </span>
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                        45+ Forks
                      </span>
                    </div>
                    
                    <span className="text-secondary text-sm inline-flex items-center group-hover:underline">
                      View Repository
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </motion.a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
        
        {/* Skills Marquee - Enhanced */}
        <div className="mt-12 overflow-hidden">
          <FadeIn>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Technical Skills</h3>
              <div className="px-3 py-1 bg-base-200/50 rounded-full text-sm text-base-content/70 border border-primary/10 animate-pulse">
                <span className="inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Always learning
                </span>
              </div>
            </div>
          </FadeIn>
          
          <div className="relative w-full overflow-hidden py-4 before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-16 before:bg-gradient-to-r before:from-base-100 before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-16 after:bg-gradient-to-l after:from-base-100 after:to-transparent" ref={marqueeRef}>
            <div className="animate-marquee flex gap-4 whitespace-nowrap">
              {duplicatedSkills.map((skill, index) => {
                // Alternate between different styles
                const isEven = index % 2 === 0;
                const isPrimary = index % 3 === 0;
                const isSecondary = index % 3 === 1;
                
                let bgClass = "bg-base-200/70";
                let textClass = "text-base-content/90";
                
                if (isPrimary) {
                  bgClass = "bg-primary/10";
                  textClass = "text-primary";
                } else if (isSecondary) {
                  bgClass = "bg-secondary/10";
                  textClass = "text-secondary";
                }
                
                return (
                  <span 
                    key={`${skill}-${index}`}
                    className={`px-4 py-2 ${bgClass} rounded-full font-medium ${textClass} flex-shrink-0 border border-primary/5 shadow-sm ${isEven ? 'shadow-primary/5' : 'shadow-secondary/5'}`}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CondensedAbout;
