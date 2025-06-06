"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FadeIn } from "@/components/shared/animations/AnimatedComponents";
import { ArrowRight, Box, CircleArrowRight } from "lucide-react";
import { siteConfig } from "@/components/shared/container/site";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export function CondensedAbout() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Skills for the marquee
  const skills = [
    "React & Next.js",
    "TypeScript",
    "GraphQL",
    "Node.js",
    "Tailwind CSS",
    "React Native",
    "REST APIs",
    "Prisma & Drizzle",
    "TanStack",
    "Authentication",
    "State Management",
    "Testing",
    "CI/CD",
    "Performance Optimization",
    "Accessibility",
  ];

  // Duplicate the skills array to ensure continuous loop
  const duplicatedSkills = [...skills, ...skills];

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
        <div className=" flex flex-col gap-8 justify-center items-center w-full">
          <div className="w-full space-y-6 max-w-[90%] lg:max-w-[60%]">
            {/* Bio Text */}
            <FadeIn className="text-base-content/80 space-y-4">
              <p>
                TypeScript enthusiast based in Nairobi, Kenya with over 5 years of fullstack
                development experience. I specialize in building exceptional web experiences using
                modern technologies.
              </p>
              <p>
                My expertise spans across React frameworks, bundlers, and rendering strategies. I've
                spoken at tech conferences like Rendercon-KE about the React ecosystem and regularly
                participate in the local developer community.
              </p>
              <p>
                I excel at integrations with React and TypeScript, whether it's REST APIs, GraphQL
                clients like Apollo and Relay, tRPC, or service workers. My approach emphasizes type
                safety, clean architecture, and creating truly reusable components.
              </p>
            </FadeIn>
            <div className="w-full p-6 flex justify-center items-center gap-6">
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-outline">
                Checkout my code
                <FaGithub />
              </a>
              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-outline">
                Checkout my Professional summary
                <FaLinkedin />
              </a>
            </div>

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
                      boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    }}>
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/20 mb-3">
                      <Box className="size-6 text-primary" />
                    </div>
                    <h4 className="font-bold text-lg mb-1">RenderCon-KE</h4>
                    <p className="text-sm text-base-content/70 mb-3">
                      Exploring Modern React Rendering Strategies
                    </p>

                    <span className="text-primary text-sm inline-flex items-center group-hover:underline">
                      View Presentation
                      <ArrowRight className="size-4 text-secondary" />
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
                      boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    }}>
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/20 mb-3">
                      <CircleArrowRight className="size-6 text-secondary" />
                    </div>
                    <h4 className="font-bold text-lg mb-1">React Devs KE</h4>
                    <p className="text-sm text-base-content/70 mb-3">
                      TypeScript + React: Building Type-Safe Applications
                    </p>

                    {/* Engagement metrics */}
                    <span className="text-secondary text-sm inline-flex items-center group-hover:underline">
                      View Repository
                      <ArrowRight className="size-4 text-secondary" />
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
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Technical Skills
              </h3>
              <div className="px-3 py-1 bg-base-200/50 rounded-full text-sm text-base-content/70 border border-primary/10 animate-pulse">
                <span className="inline-flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1 text-primary"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Always learning
                </span>
              </div>
            </div>
          </FadeIn>

          <div
            className="relative w-full overflow-hidden py-4 before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-16 before:bg-gradient-to-r before:from-base-100 before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-16 after:bg-gradient-to-l after:from-base-100 after:to-transparent"
            ref={marqueeRef}>
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
                    className={`px-4 py-2 ${bgClass} rounded-full font-medium ${textClass} flex-shrink-0 border border-primary/5 shadow-sm ${isEven ? "shadow-primary/5" : "shadow-secondary/5"}`}>
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
