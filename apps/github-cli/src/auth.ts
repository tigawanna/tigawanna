import { createOAuthDeviceAuth } from "@octokit/auth-oauth-device";
import { Octokit } from "@octokit/rest";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { StoredCredentials } from "./types.js";

const CONFIG_DIR = join(homedir(), ".config", "tigawanna-github");
const CREDENTIALS_PATH = join(CONFIG_DIR, "credentials.json");

const DEFAULT_SCOPES = ["repo", "delete_repo", "read:user"];

export function getConfigDir() {
  return CONFIG_DIR;
}

export function getCredentialsPath() {
  return CREDENTIALS_PATH;
}

export async function readStoredCredentials(): Promise<StoredCredentials | null> {
  try {
    const raw = await readFile(CREDENTIALS_PATH, "utf8");
    const parsed = JSON.parse(raw) as StoredCredentials;
    if (!parsed.token || !parsed.username) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function saveCredentials(credentials: StoredCredentials) {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2), {
    mode: 0o600,
  });
}

export async function clearCredentials() {
  try {
    await unlink(CREDENTIALS_PATH);
  } catch {
    return;
  }
}

export function resolveToken(): string | null {
  return process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? null;
}

export async function resolveAuth(): Promise<StoredCredentials | null> {
  const envToken = resolveToken();
  if (envToken) {
    const octokit = new Octokit({ auth: envToken });
    const { data } = await octokit.users.getAuthenticated();
    return {
      token: envToken,
      username: data.login,
      loginMethod: "pat",
    };
  }
  return readStoredCredentials();
}

export async function loginWithPat(token: string): Promise<StoredCredentials> {
  const trimmed = token.trim();
  if (!trimmed) {
    throw new Error("Token cannot be empty");
  }

  const octokit = new Octokit({ auth: trimmed });
  const { data } = await octokit.users.getAuthenticated();

  const credentials: StoredCredentials = {
    token: trimmed,
    username: data.login,
    loginMethod: "pat",
  };

  await saveCredentials(credentials);
  return credentials;
}

export type DeviceLoginCallbacks = {
  onVerification: (verification: { verification_uri: string; user_code: string }) => void;
  onPoll?: () => void;
};

export async function loginWithDeviceFlow(
  clientId: string,
  callbacks: DeviceLoginCallbacks,
): Promise<StoredCredentials> {
  if (!clientId.trim()) {
    throw new Error("Set GITHUB_OAUTH_CLIENT_ID to a GitHub OAuth App client ID for device login");
  }

  const auth = createOAuthDeviceAuth({
    clientType: "oauth-app",
    clientId: clientId.trim(),
    scopes: DEFAULT_SCOPES,
    onVerification: callbacks.onVerification,
  });

  const tokenAuth = await auth({ type: "oauth" });
  const token = tokenAuth.token;
  if (!token) {
    throw new Error("Device login did not return a token");
  }

  const octokit = new Octokit({ auth: token });
  const { data } = await octokit.users.getAuthenticated();

  const credentials: StoredCredentials = {
    token,
    username: data.login,
    loginMethod: "device",
  };

  await saveCredentials(credentials);
  return credentials;
}
