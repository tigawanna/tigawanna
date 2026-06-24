#!/usr/bin/env bun

import { Command } from "commander";
import {
  clearCredentials,
  loginWithDeviceFlow,
  loginWithPat,
  readStoredCredentials,
  resolveAuth,
} from "./auth.js";

const program = new Command();

program.name("tigawanna-gh").description("Interactive GitHub repository manager").version("0.0.1");

program
  .command("login")
  .description("Sign in with a personal access token or device flow")
  .option("--token <token>", "GitHub personal access token")
  .option("--device", "Use OAuth device flow (requires GITHUB_OAUTH_CLIENT_ID)")
  .action(async (options: { token?: string; device?: boolean }) => {
    if (options.device) {
      const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
      if (!clientId) {
        console.error("Set GITHUB_OAUTH_CLIENT_ID for device login.");
        process.exit(1);
      }

      const credentials = await loginWithDeviceFlow(clientId, {
        onVerification: (verification) => {
          console.log(`Open ${verification.verification_uri}`);
          console.log(`Enter code: ${verification.user_code}`);
        },
      });

      console.log(`Signed in as @${credentials.username}`);
      return;
    }

    const token = options.token ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
    if (!token) {
      console.error("Provide --token or set GITHUB_TOKEN / GH_TOKEN.");
      process.exit(1);
    }

    const credentials = await loginWithPat(token);
    console.log(`Signed in as @${credentials.username}`);
  });

program
  .command("logout")
  .description("Remove stored credentials")
  .action(async () => {
    await clearCredentials();
    console.log("Logged out.");
  });

program
  .command("whoami")
  .description("Show the current GitHub user")
  .action(async () => {
    const credentials = await resolveAuth();
    if (!credentials) {
      console.log("Not signed in.");
      process.exit(1);
    }
    const stored = await readStoredCredentials();
    const source = stored ? `stored (${stored.loginMethod})` : "environment";
    console.log(`@${credentials.username} (${source})`);
  });

program
  .command("repos", { isDefault: true })
  .description("Open the interactive repository manager")
  .action(async () => {
    const { runTui } = await import("./tui/run.js");
    await runTui();
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
