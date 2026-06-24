'use client';

import { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import { PerformanceLevel, useAnimationPerformance } from './use-animation-performance';

type AnimationOptions = {
  // When to trigger the animation (0-1 where 1 means fully in view)
  threshold?: number;
  
  // Only animate once
  once?: boolean;
  
  // Delay before animation starts (in seconds)
  delay?: number;
  
  // Duration of the animation (in seconds)
  duration?: number;
  
  // Root margin for triggering earlier/later
  rootMargin?: string;
}

// Animation start positions
export type AnimationEntry = 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'zoomIn' | 'none';

/**
 * Hook for optimized scroll-based animations with performance considerations
 */
export function useOptimizedAnimation(
  type: AnimationEntry = 'fadeIn',
  options: AnimationOptions = {}
) {
  const {
    threshold = 0.1,
    once = false,
    delay = 0,
    duration = 0.6,
    rootMargin = "0px"
  } = options;
  
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { 
    once, 
    amount: threshold,
    // Framer-motion types don't match exactly, so we use type assertion
    margin: rootMargin as any
  });
  
  // Get performance level to optimize animations
  const { performanceLevel, isReducedMotion } = useAnimationPerformance();
  
  // Skip animations for reduced motion preference
  if (isReducedMotion) {
    return {
      ref,
      style: {},
      className: '',
      isInView: true, // Always "in view" to avoid animations
    };
  }
  
  // Determine animation complexity based on performance level
  const getAnimationProperties = () => {
    // Skip animation if performance level is none
    if (performanceLevel === PerformanceLevel.None || type === 'none') {
      return { className: '', style: {} };
    }
    
    // Optimize duration based on performance
    const optimizedDuration = 
      performanceLevel === PerformanceLevel.High 
        ? duration 
        : performanceLevel === PerformanceLevel.Medium 
          ? duration * 0.8 
          : duration * 0.6;
    
    // Optimize delay for performance
    const optimizedDelay = 
      performanceLevel === PerformanceLevel.Low ? 0 : delay;
    
    // Determine animation class and style
    const baseClassName = 'animate-';
    let animationName = '';
    let animationStyle = {};
    
    switch (type) {
      case 'fadeIn':
        animationName = 'fade-in';
        break;
      case 'fadeInUp':
        animationName = 'fade-in-up';
        break;
      case 'fadeInDown':
        animationName = 'fade-in-down';
        break;
      case 'fadeInLeft':
        animationName = 'fade-in-left';
        break;
      case 'fadeInRight':
        animationName = 'fade-in-right';
        break;
      case 'zoomIn':
        animationName = 'zoom-in';
        break;
      default:
        animationName = 'fade-in';
    }
    
    // Set animation styles
    animationStyle = {
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : getInitialTransform(type),
      transition: `opacity ${optimizedDuration}s, transform ${optimizedDuration}s`,
      transitionDelay: `${optimizedDelay}s`,
      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    };
    
    return {
      className: `${baseClassName}${animationName}`,
      style: animationStyle,
    };
  };
  
  // Get initial transform based on animation type
  const getInitialTransform = (animationType: AnimationEntry) => {
    // Distance reduced for low performance
    const distance = performanceLevel === PerformanceLevel.Low ? '10px' : '20px';
    
    switch (animationType) {
      case 'fadeInUp':
        return `translateY(${distance})`;
      case 'fadeInDown':
        return `translateY(-${distance})`;
      case 'fadeInLeft':
        return `translateX(${distance})`;
      case 'fadeInRight':
        return `translateX(-${distance})`;
      case 'zoomIn':
        return 'scale(0.95)';
      default:
        return 'none';
    }
  };
  
  const { className, style } = getAnimationProperties();
  
  return {
    ref,
    style,
    className,
    isInView: inView,
  };
}
