import { requestAdminOtp, verifyAdminOtp } from "@/modules/admin-auth/admin-auth.functions";
import { viewerqueryOptions } from "@/data-access-layer/auth/viewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppConfig } from "@/utils/system";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const searchparams = z.object({
  returnTo: z.string().default("/backstage"),
});

export const Route = createFileRoute("/backstage/sign-in")({
  validateSearch: searchparams,
  beforeLoad: ({ context, search }) => {
    if (context.viewer?.isAdmin) {
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const Icon = AppConfig.icon;
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");

  const requestOtpMutation = useMutation({
    mutationFn: () => requestAdminOtp(),
    onSuccess: () => {
      setCodeSent(true);
      toast.success("Login code sent to Telegram");
    },
    onError: (error: unknown) => {
      toast.error("Could not send login code", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: () => verifyAdminOtp({ data: { code } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries(viewerqueryOptions);
      toast.success("Signed in");
      await navigate({ to: returnTo });
    },
    onError: (error: unknown) => {
      toast.error("Sign in failed", {
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
          <p className="text-base-content/60 mt-2 text-sm">
            We&apos;ll send a one-time code to your Telegram channel.
          </p>

          {!codeSent ? (
            <Button
              type="button"
              className="mt-6 w-full"
              disabled={requestOtpMutation.isPending}
              onClick={() => requestOtpMutation.mutate()}
              data-test="backstage-request-otp"
            >
              {requestOtpMutation.isPending ? "Sending…" : "Send login code"}
            </Button>
          ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                verifyOtpMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <label htmlFor="backstage-otp" className="text-sm font-medium">
                  Login code
                </label>
                <Input
                  id="backstage-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit code"
                  data-test="backstage-otp-input"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={code.length !== 6 || verifyOtpMutation.isPending}
                data-test="backstage-verify-otp"
              >
                {verifyOtpMutation.isPending ? "Verifying…" : "Verify and continue"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={requestOtpMutation.isPending}
                onClick={() => requestOtpMutation.mutate()}
                data-test="backstage-resend-otp"
              >
                Resend code
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
