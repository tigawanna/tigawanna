import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const ADVANCE_KEYS = ["right", "down", "space", "enter"];

export function useAdvanceHotkey(onAdvance: () => void, cooldownMs = 600) {
  const lastRef = useRef(0);

  useHotkeys(
    ADVANCE_KEYS,
    (event) => {
      if (event.repeat) return;
      const now = performance.now();
      if (now - lastRef.current < cooldownMs) return;
      lastRef.current = now;
      onAdvance();
    },
    { preventDefault: true },
    [onAdvance],
  );
}
