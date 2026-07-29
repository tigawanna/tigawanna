"use client";

import { Suspense, use, useState, useTransition } from "react";
import Link from "next/link";

const DEMO_COLORS = [
  { name: "red", value: "#FF0000" },
  { name: "green", value: "#00FF00" },
  { name: "blue", value: "#0000FF" },
  { name: "yellow", value: "#FFFF00" },
] as const;

type DemoItem = { id: string; label: string; value: string };

/** In-flight / resolved promises — must be stable across Suspense retries. */
const cache = new Map<string, Promise<DemoItem[]>>();

/**
 * Artificial delay so Suspense fallbacks are easy to see.
 */
function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns a stable promise per color. Suspense retries must see the same promise.
 */
function getDemoItems(color: string) {
  let promise = cache.get(color);
  if (!promise) {
    promise = delay(900).then(() =>
      [1, 2, 3].map((n) => ({
        id: `${color}-${n}`,
        label: `${color} item ${n}`,
        value: DEMO_COLORS.find((c) => c.name === color)?.value ?? color,
      })),
    );
    cache.set(color, promise);
  }
  return promise;
}

/**
 * Next.js demo: startTransition keeps previous UI while new data suspends.
 * Toggle off to see the Suspense fallback flash.
 */
export default function CanvasSuspensePage() {
  const [color, setColor] = useState("red");
  const [useTx, setUseTx] = useState(true);
  const [isPending, startTransition] = useTransition();

  function selectColor(next: string) {
    // Bust cache so each click re-suspends (demo needs the delay every time).
    cache.delete(next);
    if (useTx) {
      startTransition(() => setColor(next));
    } else {
      setColor(next);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">useTransition + Suspense</h2>
          <p className="text-sm text-base-content/60">
            Transition holds previous list until new data is ready
          </p>
        </div>
        <Link href="/canvas" className="text-sm text-primary underline">
          Back
        </Link>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={useTx}
          onChange={(e) => setUseTx(e.target.checked)}
          data-test="demo-use-transition"
        />
        Use <span className="font-mono">startTransition</span>
      </label>

      <div className="flex flex-wrap gap-2" data-test="demo-filters">
        {DEMO_COLORS.map((c) => (
          <button
            key={c.name}
            type="button"
            data-test={`demo-filter-${c.name}`}
            className={`btn btn-sm ${color === c.name ? "btn-primary" : "btn-ghost"}`}
            onClick={() => selectColor(c.name)}
          >
            <span className="size-3 rounded-full" style={{ backgroundColor: c.value }} />
            {c.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-base-content/50">{isPending ? "Transition pending…" : "Idle"}</p>

      <div className={isPending ? "opacity-60" : ""}>
        <Suspense fallback={<DemoSkeleton />}>
          <Results color={color} />
        </Suspense>
      </div>
    </div>
  );
}

function Results({ color }: { color: string }) {
  const items = use(getDemoItems(color));

  return (
    <ul className="flex flex-col gap-3" data-test="demo-list">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-3 rounded-2xl border border-base-content/10 px-4 py-3"
        >
          <div className="size-10 rounded-xl" style={{ backgroundColor: item.value }} />
          <span className="capitalize">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

function DemoSkeleton() {
  return (
    <div className="flex flex-col gap-3" data-test="demo-skeleton">
      <div className="skeleton h-16 w-full rounded-2xl bg-base-300" />
      <div className="skeleton h-16 w-full rounded-2xl bg-base-300" />
      <div className="skeleton h-16 w-full rounded-2xl bg-base-300" />
    </div>
  );
}
