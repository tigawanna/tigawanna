"use client";
import Image from "next/image";

export default function Intro() {
  return (
    <div className="w-full min-h-[90vh] flex justify-center items-center">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Side-by-side layout with flex-col on small screens */}
        <div className="flex flex-col md:flex-row md:justify-center items-center gap-8 md:gap-10 lg:gap-12 xl:gap-16 mx-auto">
          {/* Hero Image */}
          <div className="relative md:w-5/12 lg:w-1/3 xl:w-1/4 order-1">
            <div
              className="
              relative
              w-56 h-56 sm:w-60 sm:h-60 md:w-64 md:h-64 lg:w-56 lg:h-56 xl:w-64 xl:h-64
              group
            ">
              {/* Glow effect */}
              <div
                className={`
                absolute inset-0 -z-10
                before:absolute before:inset-0 before:bg-primary/30 before:rounded-full before:blur-2xl 
                after:absolute after:inset-0 after:bg-secondary/20 after:rounded-full after:blur-xl 
              `}></div>

              <div
                className="
                w-full h-full
                rounded-full overflow-hidden 
                shadow-xl border-4 border-primary/30 
                relative z-10
                transition-all duration-500
                hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/60
              ">
                <Image
                  src="/moi.jpg"
                  alt="Dennis Kinuthia"
                  fill
                  sizes="(max-width: 640px) 224px, (max-width: 768px) 240px, (max-width: 1024px) 256px, (max-width: 1280px) 224px, 256px"
                  className="object-cover animate-in spin-in-180 duration-[3000ms]"
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
            {/* Name */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-colors duration-700">
                Dennis Kinuthia
              </h1>
            </div>

            {/* Job Title */}
            <div className="mt-2 mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-medium text-base-content/80">
                FullStack Web Developer
              </h2>
            </div>

            {/* Brief Introduction */}
            <div>
              <p className="animate-in fade-in-25 duration-[3000ms] text-base-content/80 text-base md:text-lg max-w-xl mx-auto md:mx-0">
                I create fast, accessible, and modern web applications with TypeScript, React, and
                Next.js. Based in Nairobi, Kenya, I'm passionate about developer experience and
                building elegant solutions to complex problems.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 md:mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
              <a
                href="#about"
                className="btn btn-primary transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
                Learn More
              </a>
              <a
                href="#contact"
                className="btn btn-outline transition-all duration-300 hover:scale-105 hover:border-primary/60">
                Contact Me
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
