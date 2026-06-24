import { useState } from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import type { BulkAction, GitHubRepo } from "../types.js";

type RepoListProps = {
  repos: GitHubRepo[];
  username: string;
  loading: boolean;
  error: string | null;
  busy: boolean;
  status: string | null;
  onRefresh: () => void;
  onBulkAction: (repos: GitHubRepo[], action: BulkAction) => void;
  onLogout: () => void;
  onQuit: () => void;
};

type ConfirmState = {
  action: BulkAction;
  repos: GitHubRepo[];
};

const ACTION_LABELS: Record<BulkAction, string> = {
  delete: "Delete",
  public: "Make public",
  private: "Make private",
};

export function RepoList({
  repos,
  username,
  loading,
  error,
  busy,
  status,
  onRefresh,
  onBulkAction,
  onLogout,
  onQuit,
}: RepoListProps) {
  const { height } = useTerminalDimensions();
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const filteredRepos = repos;

  const listHeight = Math.max(8, height - 12);
  const visibleStart = Math.max(
    0,
    Math.min(cursor - Math.floor(listHeight / 2), filteredRepos.length - listHeight),
  );
  const visibleRepos = filteredRepos.slice(visibleStart, visibleStart + listHeight);

  function toggleAt(index: number) {
    const repo = filteredRepos[index];
    if (!repo) {
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(repo.id)) {
        next.delete(repo.id);
      } else {
        next.add(repo.id);
      }
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(filteredRepos.map((repo) => repo.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function selectedRepos(): GitHubRepo[] {
    return repos.filter((repo) => selected.has(repo.id));
  }

  function requestAction(action: BulkAction) {
    const picked = selectedRepos();
    if (picked.length === 0) {
      return;
    }
    setConfirm({ action, repos: picked });
  }

  useKeyboard((key) => {
    if (busy) {
      return;
    }

    if (confirm) {
      if (key.name === "y") {
        const pending = confirm;
        setConfirm(null);
        onBulkAction(pending.repos, pending.action);
      } else if (key.name === "n" || key.name === "escape") {
        setConfirm(null);
      }
      return;
    }

    if (key.name === "escape" || key.name === "q") {
      onQuit();
      return;
    }

    if (key.name === "up" || key.name === "k") {
      setCursor((prev) => Math.max(0, prev - 1));
      return;
    }

    if (key.name === "down" || key.name === "j") {
      setCursor((prev) => Math.min(filteredRepos.length - 1, prev + 1));
      return;
    }

    if (key.name === "space") {
      toggleAt(cursor);
      return;
    }

    if (key.name === "a") {
      selectAll();
      return;
    }

    if (key.name === "c") {
      clearSelection();
      return;
    }

    if (key.name === "r") {
      onRefresh();
      return;
    }

    if (key.name === "l") {
      onLogout();
      return;
    }

    if (key.name === "d") {
      requestAction("delete");
      return;
    }

    if (key.name === "p") {
      requestAction("private");
      return;
    }

    if (key.name === "o") {
      requestAction("public");
    }
  });

  if (loading) {
    return (
      <box
        data-test="repo-list-loading"
        style={{
          flexDirection: "column",
          gap: 1,
          padding: 2,
          width: "100%",
          height: "100%",
        }}
      >
        <text>Loading repositories for @{username}…</text>
      </box>
    );
  }

  if (error) {
    return (
      <box
        data-test="repo-list-error"
        style={{
          flexDirection: "column",
          gap: 1,
          padding: 2,
          width: "100%",
          height: "100%",
        }}
      >
        <text fg="#f38ba8">{error}</text>
        <text fg="#6c7086">r — retry · l — logout · q — quit</text>
      </box>
    );
  }

  return (
    <box
      data-test="repo-list"
      style={{
        flexDirection: "column",
        gap: 1,
        padding: 1,
        width: "100%",
        height: "100%",
      }}
    >
      <box style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <text>
          <b>@{username}</b> — {repos.length} repos · {selected.size} selected
        </text>
        {busy ? <text fg="#f9e2af">Working…</text> : null}
      </box>

      <scrollbox
        data-test="repo-scrollbox"
        style={{
          height: listHeight,
          border: true,
          flexGrow: 1,
        }}
      >
        {filteredRepos.length === 0 ? (
          <text fg="#6c7086">No repositories found.</text>
        ) : (
          visibleRepos.map((repo, offset) => {
            const index = visibleStart + offset;
            const isCursor = index === cursor;
            const isSelected = selected.has(repo.id);
            const visibility = repo.private ? "private" : "public";

            return (
              <box key={repo.id} style={{ flexDirection: "row", gap: 1 }}>
                <text fg={isCursor ? "#89b4fa" : "#6c7086"}>{isCursor ? "›" : " "}</text>
                <text fg={isSelected ? "#a6e3a1" : "#cdd6f4"}>{isSelected ? "◉" : "○"}</text>
                <text>{isCursor ? <b>{repo.fullName}</b> : repo.fullName}</text>
                <text fg="#6c7086">[{visibility}]</text>
                {repo.description ? <text fg="#6c7086">— {repo.description}</text> : null}
              </box>
            );
          })
        )}
      </scrollbox>

      {status ? <text fg="#89b4fa">{status}</text> : null}

      {confirm ? (
        <box
          data-test="confirm-dialog"
          style={{
            border: true,
            padding: 1,
            flexDirection: "column",
            gap: 1,
          }}
        >
          <text fg="#f9e2af">
            {ACTION_LABELS[confirm.action]} {confirm.repos.length} repositor
            {confirm.repos.length === 1 ? "y" : "ies"}?
          </text>
          {confirm.repos.slice(0, 5).map((repo) => (
            <text key={repo.id} fg="#cdd6f4">
              · {repo.fullName}
            </text>
          ))}
          {confirm.repos.length > 5 ? (
            <text fg="#6c7086">…and {confirm.repos.length - 5} more</text>
          ) : null}
          <text>
            <b>y</b> confirm · <b>n</b> cancel
          </text>
        </box>
      ) : (
        <text fg="#6c7086">
          ↑↓ navigate · Space select · a all · c clear · p private · o public · d delete · r refresh
          · l logout · q quit
        </text>
      )}
    </box>
  );
}
