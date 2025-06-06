"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FadeIn } from "@/components/shared/animations/AnimatedComponents";
import { ExternalLink } from "lucide-react";

export function TalksSection() {
  return (
    <section id="talks" className="w-full py-16">
      <div className="container mx-auto px-6">
        <FadeIn className="mb-10">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Conference Talks & Presentations
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* RenderCon Talk */}
          <FadeIn>
            <motion.div
              className="bg-base-200/50 rounded-2xl overflow-hidden border border-primary/10 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full"
              whileHover={{ scale: 1.01 }}>
              <div className="relative h-56 w-full">
                <Image
                  src="/Rendercon.png"
                  alt="RenderCon Kenya"
                  fill
                  className="object-contain bg-black/80 p-4"
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-primary">RenderCon-KE</h3>
                <p className="mb-4 text-base-content/80">
                  I presented "Exploring Modern React Rendering Strategies" at RenderCon Kenya,
                  discussing different rendering patterns in modern React applications including
                  SSR, SSG, ISR, and client-side rendering approaches.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge">React</span>
                  <span className="badge ">SSR overview</span>
                  <span className="badge">React renderers</span>
                  <span className="badge">React frameworks</span>
                </div>

                <div className="flex justify-between items-center">
                  <a
                    href="https://docs.google.com/presentation/d/14q3-684ay5uK7Rhtp8ysj5ZVgCk_rsWsf7k9SFPHSKk/edit?usp=drivesdk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn  btn-link">
                    View Presentation
                    <ExternalLink className="size-3 ml-2" />
                  </a>
                </div>
              </div>
            </motion.div>
          </FadeIn>

          {/* React Devs KE Presentation */}
          <FadeIn delay={0.2}>
            <motion.div
              className="bg-base-200/50 rounded-2xl overflow-hidden border border-secondary/10 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full"
              whileHover={{ scale: 1.01 }}>
              <div className="relative h-56 w-full">
                <Image
                  src="/react-dev-ke.png"
                  alt="React Devs KE"
                  fill
                  className="object-contain bg-gradient-to-b from-gray-900 to-black p-4"
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-secondary">React Devs KE</h3>
                <p className="mb-4 text-base-content/80">
                  I presented "TypeScript + React: Building Type-Safe Applications" at the React
                  Developers Kenya meetup, demonstrating how to leverage TypeScript's type system to
                  build more robust React applications.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge badge-secondary">TypeScript</span>
                  <span className="badge badge-primary">React</span>
                  <span className="badge">Type Safety</span>
                  <span className="badge">Best Practices</span>
                </div>

                <div className="flex justify-between items-center">
                  <a
                    href="https://github.com/tigawanna/ReactDevsKe-Meetup-February-2025"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-link">
                    View Repository
                    <ExternalLink className="size-3 ml-2" />
                  </a>
                </div>
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

export default TalksSection;
