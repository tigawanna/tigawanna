import { createFileRoute, Link } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DEMO_COLORS, demoItemsQueryOptions } from "../-utils/demo-data";

export const Route = createFileRoute("/canvas/keep/")({
  validateSearch: z.object({
    color: z.string().default("red"),
  }),
  pendingComponent: () => null,
  component: RouteComponent,
});

/**
 * Workaround: useQuery + keepPreviousData.
 * Filters stay mounted; list keeps showing old items while isFetching.
 */
function RouteComponent() {
  const { color } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data, isFetching, isPlaceholderData } = useQuery({
    ...demoItemsQueryOptions(color),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">useQuery + keepPreviousData</h2>
          <p className="text-sm text-base-content/60">
            No Suspense flicker — old list stays until new data arrives
          </p>
        </div>
        <Link
          to="/canvas/suspense"
          search={{ color: "red" }}
          className="text-sm text-primary underline"
        >
          Compare: suspense
        </Link>
      </div>

      <div className="flex flex-wrap gap-2" data-test="demo-filters">
        {DEMO_COLORS.map((c) => (
          <button
            key={c.name}
            type="button"
            data-test={`demo-filter-${c.name}`}
            className={`btn btn-sm ${color === c.name ? "btn-primary" : "btn-ghost"}`}
            onClick={() => navigate({ search: { color: c.name } })}
          >
            <span className="size-3 rounded-full" style={{ backgroundColor: c.value }} />
            {c.name}
          </button>
        ))}
      </div>

      <p className="text-xs text-base-content/50">
        {isFetching ? "Fetching…" : "Idle"}
        {isPlaceholderData ? " · showing previous data" : ""}
      </p>

      <ul
        className={`flex flex-col gap-3 ${isFetching ? "opacity-60" : ""}`}
        data-test="demo-list"
      >
        {(data ?? []).map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-base-content/10 px-4 py-3"
          >
            <div className="size-10 rounded-xl" style={{ backgroundColor: item.value }} />
            <span className="capitalize">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
