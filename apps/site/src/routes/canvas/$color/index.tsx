import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/canvas/$color/")({
  pendingComponent: () => null,
  component: RouteComponent,
});

function RouteComponent() {
  const { color } = Route.useParams();

  return (
    <div data-test="canvas-detail" className="relative flex flex-1 items-center justify-center">
      <Link
        to="/canvas"
        viewTransition={{ types: ["wipe-back"] }}
        className="absolute top-0 left-6 text-sm text-primary hover:underline"
        data-test="canvas-back"
      >
        Back
      </Link>
      <div className="flex items-center gap-8">
        <div className="size-60 rounded-2xl" style={{ backgroundColor: color }} />
        <p className="max-w-md text-5xl font-bold capitalize">
          This box has the color {color}
        </p>
      </div>
    </div>
  );
}
