import { useSyncExternalStore } from "react";

const LG_QUERY = "(min-width: 1024px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function getSnapshot() {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return false;
  return window.matchMedia(LG_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

function subscribe(onStoreChange: () => void) {
  const lg = window.matchMedia(LG_QUERY);
  const reduced = window.matchMedia(REDUCED_MOTION_QUERY);

  const notify = () => onStoreChange();
  lg.addEventListener("change", notify);
  reduced.addEventListener("change", notify);

  return () => {
    lg.removeEventListener("change", notify);
    reduced.removeEventListener("change", notify);
  };
}

export function useLgScrollMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
