import { authClient } from "@/lib/better-auth/client";
import { getAppUrl } from "@/lib/client-env";
import { Button } from "@/components/ui/button";
import { AppConfig } from "@/utils/system";
import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";

const searchparams = z.object({
  returnTo: z.string().default("/backstage"),
});

export const Route = createFileRoute("/backstage/sign-in")({
  validateSearch: searchparams,
  beforeLoad: ({ context, search }) => {
    if (context.viewer?.user) {
      throw redirect({ to: search.returnTo });
    }
  },
  component: BackstageSignInPage,
  head: () => ({
    meta: [
      {
        title: `${AppConfig.name} | Sign in`,
        description: "Backstage sign in",
      },
    ],
  }),
});

function BackstageSignInPage() {
  const { returnTo } = Route.useSearch();
  const Icon = AppConfig.icon;

  const mutation = useMutation({
    mutationFn: async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${getAppUrl()}${returnTo}`,
      });
    },
    onError: (error: unknown) => {
      toast.error("Google sign-in failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  return (
    <div className="bg-base-100 flex min-h-screen flex-col">
      <header className="border-base-content/10 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <Icon className="text-primary size-5" />
            <span className="font-serif text-xl tracking-tight">
              {AppConfig.name.toLowerCase()}
              <span className="text-primary">.</span>
            </span>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-md rounded-2xl border border-base-content/10 bg-base-200/50 p-8"
          data-test="backstage-sign-in"
        >
          <h1 className="text-2xl font-semibold tracking-tight">Backstage</h1>
          <p className="text-base-content/60 mt-2 text-sm">Sign in with Google to continue.</p>
          <Button
            type="button"
            className="mt-6 w-full"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            data-test="backstage-google-sign-in"
          >
            {mutation.isPending ? "Redirecting…" : "Continue with Google"}
          </Button>
        </div>
      </main>
    </div>
  );
}
