import { useState } from "react";
import { useKeyboard } from "@opentui/react";
import { loginWithDeviceFlow, loginWithPat } from "../auth.js";

type LoginScreenProps = {
  username: string | null;
  onSuccess: (username: string) => void;
  onCancel: () => void;
};

type LoginMode = "menu" | "pat" | "device";

export function LoginScreen({ username, onSuccess, onCancel }: LoginScreenProps) {
  const [mode, setMode] = useState<LoginMode>("menu");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<{
    uri: string;
    code: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  useKeyboard((key) => {
    if (busy) {
      return;
    }

    if (key.name === "escape") {
      if (mode === "menu") {
        onCancel();
      } else {
        setMode("menu");
        setError(null);
        setStatus(null);
        setDeviceInfo(null);
        setToken("");
      }
      return;
    }

    if (mode === "menu") {
      if (key.name === "1") {
        setMode("pat");
        setError(null);
        setStatus(null);
      }
      if (key.name === "2") {
        setMode("device");
        setError(null);
        setStatus(null);
      }
    }
  });

  async function handlePatLogin() {
    setBusy(true);
    setError(null);
    setStatus("Verifying token…");

    try {
      const credentials = await loginWithPat(token);
      onSuccess(credentials.username);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeviceLogin() {
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
    if (!clientId) {
      setError("Set GITHUB_OAUTH_CLIENT_ID for device login");
      return;
    }

    setBusy(true);
    setError(null);
    setStatus("Starting device login…");
    setDeviceInfo(null);

    try {
      const credentials = await loginWithDeviceFlow(clientId, {
        onVerification: (verification) => {
          setDeviceInfo({
            uri: verification.verification_uri,
            code: verification.user_code,
          });
          setStatus("Waiting for authorization in the browser…");
        },
      });
      onSuccess(credentials.username);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  if (mode === "menu") {
    return (
      <box
        data-test="login-screen"
        style={{
          flexDirection: "column",
          gap: 1,
          padding: 2,
          border: true,
          width: "100%",
          height: "100%",
        }}
      >
        <text>
          <b>tigawanna-gh</b> — GitHub login
        </text>
        {username ? (
          <text fg="#a6e3a1">Currently signed in as @{username}</text>
        ) : (
          <text fg="#a6adc8">Not signed in</text>
        )}
        <text fg="#a6adc8">Choose a login method:</text>
        <box style={{ flexDirection: "column", gap: 1, paddingLeft: 2 }}>
          <text>1 — Personal Access Token (recommended)</text>
          <text>2 — Device flow (requires GITHUB_OAUTH_CLIENT_ID)</text>
        </box>
        <text fg="#6c7086">Press Esc to go back or quit</text>
        {error ? <text fg="#f38ba8">{error}</text> : null}
      </box>
    );
  }

  if (mode === "device") {
    return (
      <box
        data-test="device-login"
        style={{
          flexDirection: "column",
          gap: 1,
          padding: 2,
          border: true,
          width: "100%",
          height: "100%",
        }}
      >
        <text>
          <b>Device login</b>
        </text>
        {deviceInfo ? (
          <box style={{ flexDirection: "column", gap: 1 }}>
            <text>Open: {deviceInfo.uri}</text>
            <text>
              Code: <b>{deviceInfo.code}</b>
            </text>
          </box>
        ) : (
          <text fg="#a6adc8">Press Enter to start device login</text>
        )}
        {status ? <text fg="#89b4fa">{status}</text> : null}
        {error ? <text fg="#f38ba8">{error}</text> : null}
        <text fg="#6c7086">Esc — back</text>
        <DeviceLoginKeyboard onStart={handleDeviceLogin} disabled={busy || Boolean(deviceInfo)} />
      </box>
    );
  }

  return (
    <box
      data-test="pat-login"
      style={{
        flexDirection: "column",
        gap: 1,
        padding: 2,
        border: true,
        width: "100%",
        height: "100%",
      }}
    >
      <text>
        <b>Personal Access Token</b>
      </text>
      <text fg="#a6adc8">
        Create a token at github.com/settings/tokens with repo and delete_repo scopes.
      </text>
      <input
        data-test="pat-input"
        focused={!busy}
        placeholder="ghp_…"
        value={token}
        onInput={setToken}
        onSubmit={handlePatLogin}
        style={{ width: "100%" }}
      />
      {status ? <text fg="#89b4fa">{status}</text> : null}
      {error ? <text fg="#f38ba8">{error}</text> : null}
      <text fg="#6c7086">Enter — sign in · Esc — back</text>
    </box>
  );
}

function DeviceLoginKeyboard({ onStart, disabled }: { onStart: () => void; disabled: boolean }) {
  useKeyboard((key) => {
    if (disabled) {
      return;
    }
    if (key.name === "return") {
      onStart();
    }
  });
  return null;
}
