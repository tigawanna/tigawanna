"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { AnimatedText } from "@/components/shared/animations/AnimatedComponents";

export default function EnhancedIntro() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  // Initialize GSAP animations
  useEffect(() => {
    if (!containerRef.current) return;
    
    const tl = gsap.timeline();
    
    tl.fromTo(".hero-title-char", 
      { opacity: 0, y: 100 },
      { 
        opacity: 1, 
        y: 0, 
        stagger: 0.03,
        duration: 0.8,
        ease: "power3.out" 
      }
    );
    
    tl.fromTo(".hero-subtitle",
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6,
        ease: "power2.out" 
      },
      "-=0.4"
    );
    
    tl.fromTo(".hero-image", 
      { opacity: 0, scale: 0.8 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 1,
        ease: "elastic.out(1, 0.5)" 
      },
      "-=0.5"
    );
    
    tl.fromTo(".hero-cta", 
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out" 
      },
      "-=0.5"
    );
    
    // Create floating animation
    gsap.to(".hero-image", {
      y: "10px",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    // Particles effect
    const particles = document.querySelectorAll(".particle");
    particles.forEach((particle, i) => {
      gsap.set(particle, {
        x: `random(-100, 100)`,
        y: `random(-100, 100)`,
        opacity: `random(0.2, 0.6)`,
        scale: `random(0.5, 1.5)`
      });
      
      gsap.to(particle, {
        x: `random(-150, 150)`,
        y: `random(-150, 150)`,
        opacity: `random(0.2, 0.6)`,
        scale: `random(0.5, 2)`,
        duration: `random(10, 20)`,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });
    
    return () => {
      tl.kill();
    };
  }, []);

  // Split text for animation
  const nameText = "Dennis Kinuthia";
  const charArray = nameText.split("");
  
  return (
    <motion.div 
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ opacity }}
      id="#"
    >
      {/* Particles background */}
      {Array(20).fill(null).map((_, i) => (
        <div 
          key={i} 
          className={`particle absolute rounded-full ${
            i % 3 === 0 
              ? 'bg-primary/30' 
              : i % 3 === 1 
                ? 'bg-secondary/30' 
                : 'bg-accent/30'
          }`} 
          style={{ 
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`
          }}
        ></div>
      ))}
      
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-base-300 to-transparent opacity-30"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-base-300 to-transparent opacity-30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary-rgb),0.1),transparent_50%)]"></div>
      </div>

      <motion.div 
        className="container mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16"
        style={{ y }}
      >
        <div ref={textRef} className="w-full lg:w-3/5 text-center lg:text-left">
          <div className="text-xl font-medium text-primary/80 mb-4 hero-subtitle">
            Hi there, I am
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 relative overflow-hidden">
            <span className="sr-only">{nameText}</span>
            <span aria-hidden="true" className="block">
              {charArray.map((char, index) => (
                <span 
                  key={index} 
                  className={`hero-title-char inline-block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent`}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
          </h1>
          
          <div className="hero-subtitle mb-8 h-16 md:h-20">
            <TypeAnimation
              cursor={true}
              sequence={[
                "JavaScript Developer", 
                1000,
                "TypeScript Expert",
                1000,
                "React Enthusiast",
                1000,
                "Fullstack Engineer",
                1000,
                "GraphQL Developer",
                1000
              ]}
              wrapper="h2"
              repeat={Infinity}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-secondary via-secondary/80 to-accent bg-clip-text text-transparent"
            />
          </div>
          
          <p className="text-base-content/70 mb-8 max-w-xl mx-auto lg:mx-0 text-lg hero-subtitle">
            Crafting exceptional web experiences with full-stack TypeScript and modern frameworks. Based in Nairobi, Kenya.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <motion.a 
              href="#projects"
              className="hero-cta btn btn-primary btn-lg glass group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">View My Work</span>
              <span className="absolute inset-0 rounded-lg bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </motion.a>
            
            <motion.a 
              href="#contact"
              className="hero-cta btn btn-outline btn-lg glass"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Me
            </motion.a>
          </div>
        </div>
        
        <motion.div 
          ref={imageRef}
          className="hero-image relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"
          style={{ scale }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20 animate-pulse"></div>
          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-base-content/5 shadow-2xl">
            <Image
              src="/moi.jpg"
              alt="Dennis Kinuthia"
              fill
              sizes="(max-width: 768px) 256px, (max-width: 1200px) 320px, 384px"
              className="object-cover"
              priority
            />
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-primary/30 backdrop-blur-md"></div>
          <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-secondary/30 backdrop-blur-md"></div>
          <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-8 rounded-full bg-accent/30 backdrop-blur-md"></div>
        </motion.div>
      </motion.div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <div className="w-2 h-2 bg-primary rounded-full" />
      </motion.div>
    </motion.div>
  );
}
