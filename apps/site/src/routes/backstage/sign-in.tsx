import { viewerqueryOptions } from "@/data-access-layer/auth/viewer";
import { authClient } from "@/lib/better-auth/client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAppForm } from "@/lib/tanstack/form";
import { AppConfig } from "@/utils/system";
import { formOptions } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { backstageAuthErrorDescription } from "@/lib/better-auth/client-auth-errors";
import { z } from "zod";

const searchparams = z.object({
  returnTo: z
    .string()
    .default("/backstage")
    .transform((value) => {
      if (value.startsWith("/") && !value.startsWith("//")) {
        return value;
      }
      return "/backstage";
    }),
});

const emailFormOpts = formOptions({
  defaultValues: {
    email: "",
  },
});

export const Route = createFileRoute("/backstage/sign-in")({
  validateSearch: searchparams,
  beforeLoad: ({ context, search }) => {
    if (context.viewer?.role === "admin") {
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

type OtpStep = "email" | "code";

function BackstageSignInPage() {
  const { returnTo } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const Icon = AppConfig.icon;

  const [otpStep, setOtpStep] = useState<OtpStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  async function afterAuthSuccess() {
    await queryClient.invalidateQueries(viewerqueryOptions);
    toast.success("Signed in");
    await navigate({ to: returnTo, replace: true });
  }

  const sendOtpMutation = useMutation({
    mutationFn: async (nextEmail: string) => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: nextEmail,
        type: "sign-in",
      });
      if (error) {
        throw error;
      }
      return nextEmail;
    },
    onSuccess: (nextEmail) => {
      setEmail(nextEmail);
      setOtp("");
      setOtpStep("code");
      toast.success("Code sent");
    },
    onError: (error: unknown) => {
      toast.error("Could not send code", {
        description: backstageAuthErrorDescription(error),
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signIn.emailOtp({
        email,
        otp,
        name: email.split("@")[0] || "Admin",
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await afterAuthSuccess();
    },
    onError: (error: unknown) => {
      toast.error("Sign in failed", {
        description: backstageAuthErrorDescription(error),
      });
    },
  });

  const emailForm = useAppForm({
    ...emailFormOpts,
    validators: {
      onSubmit: z.object({
        email: z.email("Enter a valid email"),
      }),
    },
    onSubmit: async ({ value }) => {
      await sendOtpMutation.mutateAsync(value.email.trim().toLowerCase());
    },
  });

  const isPending = sendOtpMutation.isPending || verifyOtpMutation.isPending;

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
          className="border-base-content/10 bg-base-200/50 w-full max-w-md rounded-2xl border p-8"
          data-test="backstage-sign-in"
        >
          <p className="text-base-content/50 text-xs font-medium tracking-[0.16em] uppercase">
            Backstage
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {otpStep === "email" ? "Sign in" : "Enter your code"}
          </h1>
          <p className="text-base-content/60 mt-2 text-sm">
            {otpStep === "email"
              ? "We'll send a one-time code to sign you in."
              : `Enter the 6-digit code sent for ${email}.`}
          </p>

          {otpStep === "email" ? (
            <form
              className="mt-6 space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void emailForm.handleSubmit();
              }}
              data-test="backstage-otp-email-form"
            >
              <emailForm.AppField name="email">
                {(field) => (
                  <field.EmailField
                    label="Email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isPending}
                    data-test="backstage-email-input"
                  />
                )}
              </emailForm.AppField>

              <emailForm.AppForm>
                <emailForm.SubmitButton
                  label="Send code"
                  className="w-full"
                  data-test="backstage-send-otp"
                />
              </emailForm.AppForm>
            </form>
          ) : (
            <form
              className="mt-6 space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                verifyOtpMutation.mutate();
              }}
              data-test="backstage-otp-code-form"
            >
              <div className="space-y-2">
                <Label htmlFor="backstage-otp">One-time code</Label>
                <InputOTP
                  id="backstage-otp"
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isPending}
                  autoFocus
                  data-test="backstage-otp-input"
                >
                  <InputOTPGroup className="w-full justify-between gap-2">
                    <InputOTPSlot index={0} className="size-11 first:rounded-md" />
                    <InputOTPSlot index={1} className="size-11" />
                    <InputOTPSlot index={2} className="size-11" />
                    <InputOTPSlot index={3} className="size-11" />
                    <InputOTPSlot index={4} className="size-11" />
                    <InputOTPSlot index={5} className="size-11 last:rounded-md" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isPending || otp.length !== 6}
                data-test="backstage-verify-otp"
              >
                {verifyOtpMutation.isPending ? "Signing in…" : "Verify and sign in"}
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  disabled={isPending}
                  onClick={() => {
                    setOtp("");
                    setOtpStep("email");
                  }}
                  data-test="backstage-otp-change-email"
                >
                  Change email
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  disabled={isPending}
                  onClick={() => sendOtpMutation.mutate(email)}
                  data-test="backstage-otp-resend"
                >
                  {sendOtpMutation.isPending ? "Sending…" : "Resend code"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
