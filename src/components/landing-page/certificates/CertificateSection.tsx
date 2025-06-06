"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FadeIn } from "@/components/shared/animations/AnimatedComponents";

export function CertificateSection() {
  return (
    <section id="certificates" className="w-full py-16 bg-base-200/30">
      <div className="container mx-auto px-6">
        <FadeIn className="mb-10">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Certifications
          </h2>
        </FadeIn>

        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <motion.div
              className="bg-base-100/80 rounded-2xl overflow-hidden border border-primary/10 shadow-lg"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}>
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src="/alx.png"
                  alt="ALX Software Engineering Certificate"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2 text-primary">ALX Software Engineering</h3>
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                  <span className="badge badge-lg">Graduated: November 2023</span>
                  <span className="badge badge-accent badge-outline">12-Month Programme</span>
                </div>

                <p className="mb-6 text-base-content/80">
                  Completed a comprehensive 12-month Software Engineering Programme with ALX Africa,
                  specializing in Back-end development. The program covered fundamental computer
                  science concepts, algorithms and data structures, system design, and practical
                  software engineering skills.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="badge badge-primary">Backend Development</span>
                  <span className="badge badge-secondary">System Design</span>
                  <span className="badge">Algorithms</span>
                  <span className="badge">Data Structures</span>
                  <span className="badge">Software Architecture</span>
                </div>

                <div className="bg-base-200 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Skills Acquired:</h4>
                  <ul className="list-disc list-inside space-y-1 text-base-content/80">
                    <li>Backend system architecture and design</li>
                    <li>Database optimization and management</li>
                    <li>API design and implementation</li>
                    <li>System scaling and performance optimization</li>
                    <li>DevOps and deployment strategies</li>
                  </ul>
                </div>

                <div className="flex justify-end mt-4">
                  <a
                    href="https://www.alxafrica.com/software-engineering/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-outline">
                    Learn More About ALX
                  </a>
                </div>
              </div>
            </motion.div>
          </FadeIn>

          <div className="mt-6 flex items-center justify-center text-center text-base-content/60 text-sm">
            <p>Certificate verification: Scan the QR code or visit</p>
            <a
              className="btn btn-link"
              target="_blank"
              rel="noopener noreferrer"
              href="https://savanna.alxafrica.com/certificates/y2xLJ9eFhY">
              this link
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CertificateSection;
