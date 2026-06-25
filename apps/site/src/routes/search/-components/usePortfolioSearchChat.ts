import { useAiSettings } from "@/hooks/use-ai-settings";
import { isAiLocalMode } from "@/lib/client-env";
import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

const STARTER_PROMPTS = [
  "What React or TanStack projects have you shipped?",
  "Show me work involving authentication or dashboards",
  "Any mobile, Expo, or native app repositories?",
] as const;

export function usePortfolioSearchChat(initialQuery?: string) {
  const [input, setInput] = useState(initialQuery ?? "");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, saveSettings, clearSettings } = useAiSettings();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const isReady = isAiLocalMode || Boolean(settings);

  const chat = useChat({
    id: "portfolio-search-chat",
    connection: fetchServerSentEvents("/api/ai/portfolio-search"),
    body: {
      apiKey: settings?.apiKey,
      model: settings?.model,
    },
  });

  const hasAutoSentRef = useRef(false);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ block: "end" });
  }, [chat.messages.length, chat.isLoading, chat.status]);

  useEffect(() => {
    if (!initialQuery || !isReady || hasAutoSentRef.current || chat.messages.length > 0) {
      return;
    }
    hasAutoSentRef.current = true;
    void chat.sendMessage(initialQuery);
  }, [initialQuery, isReady, chat.messages.length, chat]);

  async function submitMessage(message?: string) {
    const trimmed = (message ?? input).trim();
    if (!trimmed || chat.isLoading || !isReady) return;
    await chat.sendMessage(trimmed);
    setInput("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitMessage();
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }
    event.preventDefault();
    void submitMessage();
  }

  const activeModelLabel = settings?.model
    ? (settings.model.split("/").pop() ?? settings.model)
    : isAiLocalMode
      ? "Local"
      : null;

  return {
    activeModelLabel,
    chat,
    clearSettings,
    endOfMessagesRef,
    handleComposerKeyDown,
    handleSubmit,
    input,
    isReady,
    saveSettings,
    sendStarter: submitMessage,
    setInput,
    setSettingsOpen,
    settings,
    settingsOpen,
    starterPrompts: STARTER_PROMPTS,
  };
}
