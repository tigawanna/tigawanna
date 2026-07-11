import { ListPagination } from "@/components/pagination/ReactresponsivePagination";
import { contactMessagesQueryOptions } from "@/data-access-layer/backstage/shared-query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { format } from "date-fns";
import { useTransition } from "react";
import { z } from "zod";

const messagesSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
});

export const Route = createFileRoute("/_backstage/backstage/messages")({
  validateSearch: (search) => messagesSearchSchema.parse(search),
  beforeLoad: ({ context }) => {
    if (context.viewer?.role !== "admin") {
      throw redirect({ to: "/backstage" });
    }
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ context, deps: { page } }) =>
    context.queryClient.ensureQueryData(contactMessagesQueryOptions(page)),
  component: BackstageMessagesPage,
});

function BackstageMessagesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [, startTransition] = useTransition();
  const page = search.page ?? 1;
  const { data } = useSuspenseQuery(contactMessagesQueryOptions(page));
  const messages = data.items;
  const { pagination } = data;

  const setPage = (nextPage: number) => {
    startTransition(() => {
      void navigate({
        search: (prev) => ({
          ...prev,
          page: nextPage <= 1 ? undefined : nextPage,
        }),
        replace: true,
        viewTransition: false,
      });
    });
  };

  const rangeStart =
    pagination.totalItems === 0 ? 0 : (pagination.page - 1) * pagination.perPage + 1;
  const rangeEnd = Math.min(pagination.page * pagination.perPage, pagination.totalItems);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6" data-test="backstage-messages">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-base-content/60 mt-2 text-sm">
          Contact submissions sent to Telegram and stored in D1.
          {pagination.totalItems > 0
            ? ` Showing ${rangeStart}–${rangeEnd} of ${pagination.totalItems}.`
            : null}
        </p>
      </div>

      {messages.length === 0 ? (
        <p className="text-base-content/50 text-sm">No messages yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <article
              key={message.id}
              className="rounded-xl border border-base-content/10 bg-base-200/40 p-5"
              data-test="contact-message-row"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{message.name}</p>
                  {message.contact ? (
                    <p className="text-base-content/60 text-sm">{message.contact}</p>
                  ) : null}
                </div>
                <time className="text-base-content/45 text-xs">
                  {format(new Date(message.createdAt), "PPp")}
                </time>
              </div>
              <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
              <div className="text-base-content/40 mt-3 flex flex-wrap gap-3 text-xs">
                {message.telegramSent ? <span>Telegram sent</span> : <span>Telegram failed</span>}
                {message.ipAddress ? <span>IP: {message.ipAddress}</span> : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <ListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
        data-test="backstage-messages-pagination"
      />
    </div>
  );
}
