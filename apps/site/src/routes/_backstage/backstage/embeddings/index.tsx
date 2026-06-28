import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import {
  projectEmbeddingsListQueryOptions,
  projectEmbeddingStatsQueryOptions,
} from "@/data-access-layer/embeddings/query-options";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { BackstageEmbeddingsContent } from "../-components/BackstageEmbeddingsContent";

export const Route = createFileRoute("/_backstage/backstage/embeddings/")({
  beforeLoad: ({ context }) => {
    if (!isAdminUser(context.viewer)) {
      throw redirect({ to: "/backstage" });
    }
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(projectEmbeddingStatsQueryOptions),
      context.queryClient.ensureQueryData(projectEmbeddingsListQueryOptions),
    ]),
  component: BackstageEmbeddingsPage,
});

function BackstageEmbeddingsPage() {
  return <BackstageEmbeddingsContent />;
}
