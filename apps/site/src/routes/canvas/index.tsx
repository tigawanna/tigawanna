import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/canvas/")({
  component: RouteComponent,
});

function RouteComponent() {
  const colors = [
    {
      name: "red",
      value: "#FF0000",
    },
    {
      name: "green",
      value: "#00FF00",
    },
    {
      name: "blue",
      value: "#0000FF",
    },
    {
      name: "yellow",
      value: "#FFFF00",
    },
  ];
  return (
    <div className="text-2xl font-bold min-h-screen flex items-center justify-center">
      <div className="flex flex-col gap-4">
        {colors.map((color) => (
          <Link to={`/canvas/$color`} params={{ color: color.name }} key={color.name}>
            <div className="size-20 rounded-2xl" style={{ backgroundColor: color.value }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
