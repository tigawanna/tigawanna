import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import { contactMessagesQueryOptions } from "@/data-access-layer/backstage/query-options";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export const Route = createFileRoute("/_backstage/backstage/messages")({
  beforeLoad: ({ context }) => {
    if (!isAdminUser(context.viewer)) {
      throw redirect({ to: "/backstage" });
    }
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(contactMessagesQueryOptions),
  component: BackstageMessagesPage,
});

function BackstageMessagesPage() {
  const { data: messages } = useSuspenseQuery(contactMessagesQueryOptions);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6" data-test="backstage-messages">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-base-content/60 mt-2 text-sm">
          Contact submissions sent to Telegram and stored in D1.
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
    </div>
  );
}
