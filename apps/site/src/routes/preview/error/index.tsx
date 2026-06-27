import { RouterErrorProduction } from "@/lib/tanstack/router/routerErrorComponent";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/preview/error/")({
  beforeLoad: () => {
    if (import.meta.env.PROD) {
      throw notFound();
    }
  },
  head: () => ({
    meta: [{ title: "Error page preview" }],
  }),
  component: ErrorPreviewPage,
});

function ErrorPreviewPage() {
  return <RouterErrorProduction />;
}
