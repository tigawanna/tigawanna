import { irregular } from "animejs/easings/irregular";
import { useEffect, useRef, useState } from "react";

const MIN_RADIUS = 7;
const MAX_RADIUS = 108;
const REVEAL_MS = 900;
const FINALE_REVEAL_MS = 1350;
const HOLD_MS = 4300;
const creepyEase = irregular(12, 0.42);

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

interface PanelSequenceOptions {
  panelCount: number;
  onComplete: () => void;
  autoAdvance?: boolean;
}

export function useCreaturePanelSequence({
  panelCount,
  onComplete,
  autoAdvance = true,
}: PanelSequenceOptions) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTargetIndex, setTransitionTargetIndex] = useState<number | null>(null);

  const frameRef = useRef(0);
  const holdTimerRef = useRef(0);
  const completedRef = useRef(false);
  const activeIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  activeIndexRef.current = activeIndex;
  isTransitioningRef.current = isTransitioning;
  onCompleteRef.current = onComplete;

  const circleRadius =
    activeIndex === 0 && !isTransitioning
      ? MAX_RADIUS
      : MIN_RADIUS + easeOutCubic(revealProgress) * (MAX_RADIUS - MIN_RADIUS);

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = 0;
    }
  };

  const finishSequence = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    clearHoldTimer();
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    onCompleteRef.current();
  };

  const runTransition = (targetIndex: number) => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    clearHoldTimer();
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setTransitionTargetIndex(targetIndex);
    setRevealProgress(0);

    const start = performance.now();
    const duration = targetIndex === panelCount - 1 ? FINALE_REVEAL_MS : REVEAL_MS;

    const tick = (now: number) => {
      const raw = Math.min(1, (now - start) / duration);
      const eased =
        targetIndex === panelCount - 1
          ? Math.min(1, Math.max(raw, creepyEase(raw) * 0.72 + easeOutCubic(raw) * 0.28))
          : easeOutCubic(raw);
      setRevealProgress(eased);

      if (raw < 1) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      frameRef.current = 0;
      setActiveIndex(targetIndex);
      setRevealProgress(1);
      setIsTransitioning(false);
      setTransitionTargetIndex(null);
    };

    frameRef.current = requestAnimationFrame(tick);
  };

  const goNext = () => {
    if (completedRef.current || isTransitioningRef.current) return;

    if (activeIndexRef.current >= panelCount - 1) {
      finishSequence();
      return;
    }

    runTransition(activeIndexRef.current + 1);
  };

  useEffect(() => {
    if (!autoAdvance) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (completedRef.current || isTransitioning) return;

    clearHoldTimer();
    holdTimerRef.current = window.setTimeout(goNext, HOLD_MS);

    return clearHoldTimer;
  }, [activeIndex, isTransitioning, autoAdvance, panelCount]);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setTimeout(finishSequence, HOLD_MS * panelCount);
    return () => window.clearTimeout(timer);
  }, [panelCount]);

  useEffect(() => {
    return () => {
      clearHoldTimer();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return {
    activeIndex,
    isTransitioning,
    transitionTargetIndex,
    revealProgress,
    circleRadius,
    goNext,
    isLastPanel: activeIndex >= panelCount - 1,
  };
}
