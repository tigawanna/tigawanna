import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/canvas/")({
  pendingComponent: () => null,
  component: RouteComponent,
});

function RouteComponent() {
  const colors = [
    { name: "red", value: "#FF0000" },
    { name: "green", value: "#00FF00" },
    { name: "blue", value: "#0000FF" },
    { name: "yellow", value: "#FFFF00" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-10 p-6">
      <section className="flex w-full flex-col items-center gap-4" data-test="canvas-list">
        <h2 className="text-lg font-semibold">View transitions</h2>
        <div className="flex flex-col gap-4">
          {colors.map((color) => (
            <Link
              key={color.name}
              to="/canvas/$color"
              params={{ color: color.name }}
              viewTransition={{ types: ["wipe-forward"] }}
              data-test={`canvas-swatch-${color.name}`}
            >
              <div className="size-20 rounded-2xl" style={{ backgroundColor: color.value }} />
            </Link>
          ))}
        </div>
      </section>

      <section className="flex w-full flex-col gap-3 border-t border-base-content/10 pt-8">
        <h2 className="text-lg font-semibold">Suspense / search-param demos</h2>
        <Link
          to="/canvas/suspense"
          search={{ color: "red" }}
          className="rounded-2xl border border-base-content/10 px-4 py-3 hover:bg-base-200"
          data-test="demo-link-suspense"
        >
          <span className="font-medium">useSuspenseQuery</span>
          <span className="mt-1 block text-sm text-base-content/60">
            Param change re-suspends → flicker
          </span>
        </Link>
        <Link
          to="/canvas/keep"
          search={{ color: "red" }}
          className="rounded-2xl border border-base-content/10 px-4 py-3 hover:bg-base-200"
          data-test="demo-link-keep"
        >
          <span className="font-medium">useQuery + keepPreviousData</span>
          <span className="mt-1 block text-sm text-base-content/60">
            Keep old list while fetching
          </span>
        </Link>
      </section>
    </div>
  );
}
