import { viewerqueryOptions } from "@/data-access-layer/auth/viewer";
import { authClient } from "@/lib/better-auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppConfig } from "@/utils/system";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { parseError } from "evlog";
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

function authErrorDescription(error: unknown) {
  const { message, why, fix } = parseError(error);
  return [why, fix].filter(Boolean).join(" ") || message;
}

function BackstageSignInPage() {
  const { returnTo } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const Icon = AppConfig.icon;
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const signInMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(viewerqueryOptions);
      toast.success("Signed in");
      await navigate({ to: returnTo, replace: true });
    },
    onError: (error: unknown) => {
      toast.error("Sign in failed", {
        description: authErrorDescription(error),
      });
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: name.trim() || email.split("@")[0] || "Admin",
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(viewerqueryOptions);
      toast.success("Admin account created");
      await navigate({ to: returnTo, replace: true });
    },
    onError: (error: unknown) => {
      toast.error("Could not create admin account", {
        description: authErrorDescription(error),
      });
    },
  });

  const isPending = signInMutation.isPending || signUpMutation.isPending;

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
            {mode === "sign-in"
              ? "Sign in with your Better Auth admin account."
              : "Create the first admin account for the configured ADMIN_EMAIL."}
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (mode === "sign-in") {
                signInMutation.mutate();
                return;
              }
              signUpMutation.mutate();
            }}
          >
            {mode === "sign-up" ? (
              <div className="space-y-2">
                <Label htmlFor="backstage-name">Name</Label>
                <Input
                  id="backstage-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  disabled={isPending}
                  data-test="backstage-name-input"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="backstage-email">Email</Label>
              <Input
                id="backstage-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                disabled={isPending}
                data-test="backstage-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backstage-password">Password</Label>
              <Input
                id="backstage-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                required
                minLength={8}
                disabled={isPending}
                data-test="backstage-password-input"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || email.length === 0 || password.length < 8}
              data-test={mode === "sign-in" ? "backstage-sign-in" : "backstage-sign-up"}
            >
              {isPending ? "Working…" : mode === "sign-in" ? "Sign in" : "Create admin account"}
            </Button>
          </form>

          <Button
            type="button"
            variant="ghost"
            className="mt-3 w-full"
            disabled={isPending}
            onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
            data-test="backstage-auth-mode-toggle"
          >
            {mode === "sign-in"
              ? "Need to create the admin account?"
              : "Already have an account? Sign in"}
          </Button>
        </div>
      </main>
    </div>
  );
}
