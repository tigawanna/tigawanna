"use client";

import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

type TimeCompponentProps = {
  time: string;
  relative?: boolean;
  className?: string;
};

/**
 * Formats an ISO timestamp for landing project cards.
 * Absolute/relative labels are filled after mount to satisfy Cache Components
 * (no `Date` / `Date.now()` during client prerender without Suspense).
 */
export function TimeCompponent({ time, relative = false, className }: TimeCompponentProps) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const date = new Date(time);
    if (relative) {
      setLabel(
        new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
          Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          "day",
        ),
      );
      return;
    }
    setLabel(
      date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    );
  }, [relative, time]);

  return (
    <time dateTime={time} className={twMerge("text-xs", className)}>
      {label || "\u00a0"}
    </time>
  );
}
