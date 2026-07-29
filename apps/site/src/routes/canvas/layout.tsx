import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/canvas')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="h-full w-full flex flex-col gap-4">

      <h1 className="text-2xl font-bold w-full text-center p-2">TanStack Start · view transitions</h1>
      <Outlet />
    </div>
  );
}
