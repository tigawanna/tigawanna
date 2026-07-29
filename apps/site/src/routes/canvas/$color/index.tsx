import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/canvas/$color/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { color } = Route.useParams();
  return (
    <div className="text-2xl font-bold min-h-screen flex items-center justify-center">
      <div className="size-60 rounded-2xl" style={{ backgroundColor: color }} />
    </div>
  );
}
