import { useEffect, useState } from "react";
import { clearCredentials, resolveAuth } from "../auth.js";
import { createGitHubClient, fetchAllRepos, runBulkAction } from "../github.js";
import type { BulkAction, GitHubRepo } from "../types.js";
import { LoginScreen } from "./login-screen.js";
import { RepoList } from "./repo-list.js";

type AppProps = {
  onQuit: () => void;
};

type View = "login" | "repos";

export function App({ onQuit }: AppProps) {
  const [view, setView] = useState<View>("repos");
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function bootstrap() {
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const credentials = await resolveAuth();
      if (!credentials) {
        setView("login");
        setUsername(null);
        setToken(null);
        setRepos([]);
        return;
      }

      setUsername(credentials.username);
      setToken(credentials.token);
      setView("repos");

      const octokit = createGitHubClient(credentials.token);
      const fetched = await fetchAllRepos(octokit);
      setRepos(fetched);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setView("login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void bootstrap();
  }, []);

  async function handleBulkAction(selected: GitHubRepo[], action: BulkAction) {
    if (!token) {
      return;
    }

    setBusy(true);
    setStatus(null);
    setError(null);

    try {
      const octokit = createGitHubClient(token);
      const results = await runBulkAction(octokit, selected, action);
      const failed = results.filter((result) => !result.ok);
      const succeeded = results.filter((result) => result.ok);

      if (failed.length > 0) {
        setStatus(
          `${succeeded.length} succeeded, ${failed.length} failed. First error: ${failed[0]?.error ?? "unknown"}`,
        );
      } else {
        setStatus(
          `${ACTION_PAST[action]} ${succeeded.length} repositor${succeeded.length === 1 ? "y" : "ies"}.`,
        );
      }

      const refreshed = await fetchAllRepos(octokit);
      setRepos(refreshed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  if (view === "login") {
    return (
      <LoginScreen
        username={username}
        onSuccess={(nextUsername) => {
          setUsername(nextUsername);
          void bootstrap();
        }}
        onCancel={onQuit}
      />
    );
  }

  return (
    <RepoList
      repos={repos}
      username={username ?? "unknown"}
      loading={loading}
      error={error}
      busy={busy}
      status={status}
      onRefresh={() => {
        void bootstrap();
      }}
      onBulkAction={(selected, action) => {
        void handleBulkAction(selected, action);
      }}
      onLogout={() => {
        void clearCredentials().then(() => {
          setView("login");
          setUsername(null);
          setToken(null);
          setRepos([]);
          setError(null);
          setStatus(null);
        });
      }}
      onQuit={onQuit}
    />
  );
}

const ACTION_PAST: Record<BulkAction, string> = {
  delete: "Deleted",
  public: "Made public",
  private: "Made private",
};
