'use client';

import { useEffect, useState } from 'react';

// Performance levels
export enum PerformanceLevel {
  High = 'high',     // Full animations
  Medium = 'medium', // Reduced complexity
  Low = 'low',       // Minimal animations
  None = 'none'      // No animations
}

interface PerformanceOptions {
  // Default performance level if detection fails
  defaultLevel?: PerformanceLevel;
  
  // Enable high performance on desktop by default
  highPerformanceOnDesktop?: boolean;
  
  // Check for battery status to reduce animations on low battery
  checkBattery?: boolean;
  
  // Threshold for low memory (in GB)
  lowMemoryThreshold?: number;
  
  // Check for data-saver mode
  checkDataSaver?: boolean;
}

/**
 * Hook to determine optimal animation performance level based on device capabilities
 */
export function useAnimationPerformance(options: PerformanceOptions = {}) {
  const {
    defaultLevel = PerformanceLevel.Medium,
    highPerformanceOnDesktop = true,
    checkBattery = true,
    lowMemoryThreshold = 4,
    checkDataSaver = true
  } = options;
  
  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel>(defaultLevel);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = motionQuery.matches;
    setIsReducedMotion(prefersReducedMotion);
    
    if (prefersReducedMotion) {
      setPerformanceLevel(PerformanceLevel.None);
      return;
    }
    
    // Start with initial assessment
    let detectedLevel = defaultLevel;
    
    // Check for mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    // Desktop devices get high performance by default if enabled
    if (!isMobile && highPerformanceOnDesktop) {
      detectedLevel = PerformanceLevel.High;
    }
    
    // Check for data-saver mode
    if (checkDataSaver && 'connection' in navigator && (navigator as any).connection && 'saveData' in (navigator as any).connection) {
      if ((navigator as any).connection.saveData) {
        detectedLevel = PerformanceLevel.Low;
      }
    }
    
    // Check device memory if available
    if (
      (navigator as any).deviceMemory && 
      (navigator as any).deviceMemory < lowMemoryThreshold
    ) {
      detectedLevel = PerformanceLevel.Low;
    }
    
    // Check battery status if available
    if (checkBattery && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (battery.level < 0.15 && !battery.charging) {
          setPerformanceLevel((current) => 
            current === PerformanceLevel.None ? current : PerformanceLevel.Low
          );
        }
      }).catch(() => {
        // Battery API failed, continue with current detection
      });
    }
    
    // Set the detected performance level
    setPerformanceLevel(detectedLevel);
    
    // Listen for reduced motion preference changes
    const handleMotionChange = () => {
      setIsReducedMotion(motionQuery.matches);
      if (motionQuery.matches) {
        setPerformanceLevel(PerformanceLevel.None);
      } else {
        setPerformanceLevel(detectedLevel);
      }
    };
    
    motionQuery.addEventListener('change', handleMotionChange);
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [defaultLevel, highPerformanceOnDesktop, checkBattery, lowMemoryThreshold, checkDataSaver]);
  
  return {
    performanceLevel,
    isReducedMotion,
    
    // Helper methods
    shouldAnimate: () => performanceLevel !== PerformanceLevel.None,
    
    // Get animation parameters adjusted for performance
    getAnimationParams: <T extends Record<string, any>>(
      highParams: T,
      mediumParams: T,
      lowParams: T
    ): T => {
      switch (performanceLevel) {
        case PerformanceLevel.High:
          return highParams;
        case PerformanceLevel.Medium:
          return mediumParams;
        case PerformanceLevel.Low:
        case PerformanceLevel.None:
          return lowParams;
        default:
          return mediumParams;
      }
    }
  };
}
