import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState, useTransition } from "react";
import { z } from "zod";
import { DEMO_COLORS, demoItemsQueryOptions } from "../-utils/demo-data";

export const Route = createFileRoute("/canvas/suspense/")({
  validateSearch: z.object({
    color: z.string().default("red"),
  }),
  pendingComponent: () => null,
  component: RouteComponent,
});

/**
 * Pain pattern: search-param change + useSuspenseQuery.
 * startTransition does NOT prevent the Suspense fallback flicker here
 * (router store update isn't coordinated like React state + use()).
 */
function RouteComponent() {
  const { color } = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const [useTx, setUseTx] = useState(true);
  const [isPending, startTransition] = useTransition();

  function selectColor(next: string) {
    // Bust cache so each click re-suspends (demo needs the delay every time).
    queryClient.removeQueries({ queryKey: ["canvas-demo-items", next] });
    const go = () => navigate({ search: { color: next } });
    if (useTx) {
      startTransition(go);
    } else {
      go();
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">useSuspenseQuery</h2>
          <p className="text-sm text-base-content/60">
            startTransition has no effect — still flickers to the fallback
          </p>
        </div>
        <Link to="/canvas/keep" search={{ color: "red" }} className="text-sm text-primary underline">
          Compare: keep previous
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
        <span className="text-base-content/40">(no-op for this flicker)</span>
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

      <p className="text-xs text-base-content/50">
        {isPending ? "Transition pending… (list still suspends)" : "Idle"}
      </p>

      <div className={isPending ? "opacity-60" : ""}>
        <Suspense fallback={<DemoSkeleton />}>
          <SuspenseResults color={color} />
        </Suspense>
      </div>
    </div>
  );
}

function SuspenseResults({ color }: { color: string }) {
  const { data } = useSuspenseQuery(demoItemsQueryOptions(color));

  return (
    <ul className="flex flex-col gap-3" data-test="demo-list">
      {data.map((item) => (
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
