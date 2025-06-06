"use client";

import { useRef } from "react";
import { TailwindFadeIn } from "@/components/shared/animations/TailwindFadeIn";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { siteConfig } from "@/components/shared/container/site";

export function AboutSection() {
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
    <div className="w-full py-16 min-h-screen" id="about">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <TailwindFadeIn className="mb-10">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            About Me
          </h2>
        </TailwindFadeIn>

        {/* Content Grid */}
        <div className="flex flex-col gap-8 justify-center items-center w-full">
          <div className="w-full space-y-6 max-w-[90%] lg:max-w-[60%]">
            {/* Bio Text */}
            <TailwindFadeIn className="text-base-content/80 space-y-4">
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
            </TailwindFadeIn>
            <div className="
              w-full p-6 flex flex-wrap justify-center items-center gap-6
              animate-in fade-in duration-500 delay-200
              @starting-style:opacity-0
            ">
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
          </div>
        </div>

        {/* Skills Marquee - Enhanced with Tailwind animations */}
        <div className="mt-12 overflow-hidden">
          <TailwindFadeIn>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Technical Skills
              </h3>
              <div className="
                px-3 py-1 bg-base-200/50 rounded-full 
                text-sm text-base-content/70 
                border border-primary/10
                animate-pulse
              ">
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
          </TailwindFadeIn>

          <div
            className="
              relative w-full overflow-hidden py-4 
              before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-16 before:bg-gradient-to-r before:from-base-100 before:to-transparent 
              after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-16 after:bg-gradient-to-l after:from-base-100 after:to-transparent
              animate-in fade-in duration-700 delay-300
              @starting-style:opacity-0
            "
            ref={marqueeRef}>
            <div className="animate-marquee flex gap-4 whitespace-nowrap">
              {duplicatedSkills.map((skill, index) => {
                // Alternate between different styles
                const isEven = index % 2 === 0;
                const isPrimary = index % 3 === 0;
                const isSecondary = index % 3 === 1;

                let bgClass = "bg-base-content/10";
                let textClass = "text-base-content";

                // if (isPrimary) {
                //   bgClass = "bg-primary-content/70";
                //   textClass = "text-primary";
                // } else if (isSecondary) {
                //   bgClass = "bg-secondary/10";
                //   textClass = "text-secondary";
                // }

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

export default AboutSection;
