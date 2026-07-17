import { contactMessagesQueryOptions } from "@/data-access-layer/backstage/shared-query-options";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { BackstageMessagesList } from "./-components/messages/BackstageMessagesList";
import { BackstagePending } from "./-components/shared/BackstagePending";

const messagesSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/_backstage/backstage/messages")({
  validateSearch: (search) => messagesSearchSchema.parse(search),
  beforeLoad: ({ context }) => {
    if (context.viewer?.role !== "admin") {
      throw redirect({ to: "/backstage" });
    }
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1, q: search.q ?? "" }),
  loader: ({ context, deps: { page, q } }) =>
    context.queryClient.ensureQueryData(contactMessagesQueryOptions({ page, q })),
  component: BackstageMessagesPage,
  pendingComponent: BackstagePending,
});

function BackstageMessagesPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <BackstageMessagesList />
    </div>
  );
}
