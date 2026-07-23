import { Button } from "@repo/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/gg")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Button className="p-2">Click me</Button>
    </div>
  );
}
