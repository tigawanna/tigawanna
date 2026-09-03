import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/repos/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full min-h-screen h-full flex justify-center items-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Repos</h1>
      </div>
    </div>
  );
}
