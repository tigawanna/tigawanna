# Animation Components and Utilities

A set of animation components and utilities for creating smooth, accessible animations in Next.js applications.

## Basic Usage

### SmoothScroll Component

Wrap your application with the `SmoothScroll` component to enable smooth scrolling:

```tsx
// app/layout.tsx
import { SmoothScroll } from "@/components/shared/SmoothScroll";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
```

### Animation Components

Use the provided animation components for consistent effects:

```tsx
import { 
  AnimatedSection,
  AnimatedText,
  ParallaxImage,
  FadeIn 
} from "@/components/shared/animations/AnimatedComponents";

export default function MyPage() {
  return (
    <main>
      <AnimatedSection className="my-section">
        <h1>This section animates on scroll</h1>
        <p>Content here...</p>
      </AnimatedSection>
      
      <AnimatedText 
        text="This text animates character by character" 
        element="h2"
        className="my-heading" 
      />
      
      <ParallaxImage
        src="/path/to/image.jpg"
        alt="Description"
        className="w-full h-96 my-8"
        speed={0.5}
      />
      
      <FadeIn direction="up" delay={0.2}>
        <div>This fades in from below</div>
      </FadeIn>
    </main>
  );
}
```

### Timeline Component

Display a chronological timeline of events:

```tsx
import { Timeline } from "@/components/shared/animations/Timeline";

const timelineItems = [
  {
    year: "2023",
    title: "Senior Developer",
    description: "Led development of key features for enterprise clients."
  },
  {
    year: "2021",
    title: "Full Stack Developer",
    description: "Worked on front-end and back-end solutions."
  },
  {
    year: "2019",
    title: "Junior Developer",
    description: "Started career with focus on React development."
  }
];

export default function CareerPage() {
  return (
    <div className="container mx-auto py-12">
      <Timeline items={timelineItems} />
    </div>
  );
}
```

## Performance Optimization

### Using the Performance Hook

Use the performance hook to optimize animations based on device capabilities:

```tsx
import { useAnimationPerformance, PerformanceLevel } from "@/lib/animations/use-animation-performance";

function MyComponent() {
  const { performanceLevel, isReducedMotion, getAnimationParams } = useAnimationPerformance();
  
  // Skip animations for users who prefer reduced motion
  if (isReducedMotion) {
    return <div>Static Content</div>;
  }
  
  // Get appropriate animation parameters based on device capability
  const animationParams = getAnimationParams(
    // High performance devices
    { duration: 0.8, staggerChildren: 0.1, type: "spring" },
    // Medium performance devices
    { duration: 0.6, staggerChildren: 0.05, type: "tween" },
    // Low performance devices
    { duration: 0.3, staggerChildren: 0, type: "tween" }
  );
  
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      transition={animationParams}
    >
      Optimized animations!
    </motion.div>
  );
}
```

### Using Optimized Animation Hook

Simplify animations with the optimized animation hook:

```tsx
import { useOptimizedAnimation } from "@/lib/animations/use-optimized-animation";

function MyComponent() {
  const { ref, isInView, style, className } = useOptimizedAnimation(
    'fadeInUp',
    { 
      threshold: 0.2, 
      delay: 0.3,
      duration: 0.6,
      once: true
    }
  );
  
  return (
    <div ref={ref} style={style} className={className}>
      This component animates with optimal settings!
    </div>
  );
}
```

## Accessibility

All animation components respect user preferences for reduced motion. When a user has the "prefers-reduced-motion" setting enabled in their operating system, animations will be minimized or disabled entirely.
