import { AiProviderModal } from "@/features/portfolio-ai/AiProviderModal";
import { AiSettingsPanel } from "@/features/portfolio-ai/AiSettingsPanel";
import {
  extractPortfolioSearchResults,
  getMessageText,
} from "@/features/portfolio-ai/portfolio-chat-utils";
import { portfolioSearchQueryOptions } from "@/data-access-layer/portfolio/search-query-options";
import { toGithubRepoNode } from "@/types/portfolio-search";
import { useQuery } from "@tanstack/react-query";
import { Loader2, SendHorizontal, Sparkles, Square, WandSparkles } from "lucide-react";
import type { UIMessage } from "@tanstack/ai-react";
import { renderProjectCard } from "@/routes/-components/landing/cards/ProjectCard";
import { usePortfolioSearchChat } from "./usePortfolioSearchChat";

interface PortfolioSearchExperienceProps {
  query: string;
}

export function PortfolioSearchExperience({ query }: PortfolioSearchExperienceProps) {
  const chatState = usePortfolioSearchChat(query);
  const {
    activeModelLabel,
    chat,
    clearSettings,
    endOfMessagesRef,
    handleComposerKeyDown,
    handleSubmit,
    input,
    isReady,
    saveSettings,
    sendStarter,
    setInput,
    setSettingsOpen,
    settings,
    settingsOpen,
    starterPrompts,
  } = chatState;

  const directSearch = useQuery(portfolioSearchQueryOptions(query, settings?.apiKey));

  const toolResults = extractPortfolioSearchResults(chat.messages);
  const visibleResults = toolResults.length > 0 ? toolResults : (directSearch.data?.results ?? []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <AiSettingsPanel settings={settings} onOpenSettings={() => setSettingsOpen(true)} />
      <AiProviderModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={saveSettings}
        onClear={clearSettings}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="overflow-hidden rounded-4xl border border-base-content/10 bg-base-200/40 shadow-xl shadow-black/5">
          <div className="flex items-center gap-3 border-b border-base-content/10 px-5 py-4">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <WandSparkles className="size-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-base-content">Ask about my work</h2>
              <p className="text-sm text-base-content/60">
                {activeModelLabel
                  ? `Powered by ${activeModelLabel}`
                  : "Configure OpenRouter to begin"}
              </p>
            </div>
          </div>

          <div className="flex min-h-112 flex-col gap-4 px-5 py-5">
            {chat.messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-base-content/15 bg-base-100/50 px-6 py-10 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Sparkles className="size-5" />
                </div>
                <p className="font-serif text-2xl text-base-content">What do you want to know?</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-base-content/60">
                  Ask in plain language. I will search indexed repositories and explain what fits.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={!isReady || chat.isLoading}
                      onClick={() => void sendStarter(prompt)}
                      className="rounded-full border border-base-content/10 bg-base-100 px-4 py-2 text-sm text-base-content/75 transition-colors hover:border-primary/25 hover:text-primary disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
                {chat.messages.map((message: UIMessage) => (
                  <article
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "ml-auto max-w-[85%] rounded-3xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-content"
                        : "max-w-[92%] rounded-3xl rounded-bl-md border border-base-content/10 bg-base-100 px-4 py-3 text-sm leading-7 text-base-content/85"
                    }
                  >
                    {getMessageText(message) || (chat.isLoading ? "Thinking…" : "")}
                  </article>
                ))}
                <div ref={endOfMessagesRef} />
              </div>
            )}

            {chat.error ? (
              <div className="rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                {chat.error.message}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-auto flex flex-col gap-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                rows={3}
                disabled={!isReady || chat.isLoading}
                placeholder={
                  isReady
                    ? "Ask about stacks, product types, or problems I have solved…"
                    : "Configure your OpenRouter key above to start"
                }
                className="w-full resize-none rounded-2xl border border-base-content/10 bg-base-100 px-4 py-3 text-sm leading-6 text-base-content outline-none placeholder:text-base-content/45 focus:border-primary/30"
                data-test="portfolio-chat-input"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-base-content/50">
                  Enter to send · Shift+Enter for a new line
                </p>
                <div className="flex items-center gap-2">
                  {chat.isLoading ? (
                    <button
                      type="button"
                      onClick={() => chat.stop()}
                      className="btn btn-ghost btn-sm rounded-xl"
                    >
                      <Square className="size-4" />
                      Stop
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    disabled={!isReady || chat.isLoading || input.trim().length < 2}
                    className="btn btn-primary rounded-xl"
                    data-test="portfolio-chat-send"
                  >
                    {chat.isLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <SendHorizontal className="size-4" />
                    )}
                    Send
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="font-serif text-2xl text-base-content">Matching repositories</h2>
            <p className="mt-1 text-sm text-base-content/60">
              Ranked by semantic similarity across names, descriptions, and tags.
            </p>
          </div>

          {directSearch.isLoading && visibleResults.length === 0 ? (
            <div className="flex items-center gap-3 rounded-3xl border border-base-content/10 bg-base-200/40 px-5 py-8 text-base-content/60">
              <Loader2 className="size-5 animate-spin text-primary" />
              Finding relevant repositories…
            </div>
          ) : null}

          {directSearch.data?.mode === "empty-index" && visibleResults.length === 0 ? (
            <div className="rounded-3xl border border-base-content/10 bg-base-200/40 px-5 py-6 text-sm leading-6 text-base-content/70">
              The search index is empty. Run{" "}
              <code className="rounded bg-base-300 px-2 py-1 text-xs">
                pnpm sync:repo-embeddings
              </code>{" "}
              after configuring Turso, GitHub, and an embedding provider.
            </div>
          ) : null}

          {visibleResults.length > 0 ? (
            <div className="grid gap-5" data-test="portfolio-search-results">
              {visibleResults.map((result) => renderProjectCard(toGithubRepoNode(result)))}
            </div>
          ) : query && !directSearch.isLoading && directSearch.data?.mode !== "empty-index" ? (
            <div className="rounded-3xl border border-base-content/10 bg-base-200/40 px-5 py-6 text-sm text-base-content/65">
              No strong matches yet. Try a broader question or configure your key and ask in chat.
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
